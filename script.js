(() => {
	// Function to load WhatsApp modules asynchronously
	const loadModule = (name, id) => {
		// Skip error guards if available
		window.ErrorGuard?.skipGuardGlobal(true);
		return new Promise(r => {
			try {
				// Push module loading request to webpack chunk
				window.webpackChunkwhatsapp_web_client?.push([[Math.random()], {}, e => {
					const module = e(id);
					// Resolve promise with module's default export or module itself
					r(module.default ? module.default : module);
				}]);
				// Attempt to require module synchronously
				r(window.require?.(name));
			}
			catch (e) {
				// Handle errors by resolving with null
				r(null);
			}
		});
	};
	
	// Function to get data from IndexedDB
	const getIndexedDB = (database, table, key) => {
		return new Promise(r => {
			// Open IndexedDB database
			const dbRequest = window.indexedDB.open(database);
			
			// Successful database connection
			dbRequest.onsuccess = (event) => {
				const db = event.target.result;
				// Start a readonly transaction on specified table
				const transaction = db.transaction(table, "readonly");
				const objectStore = transaction.objectStore(table);
				// Get specific data based on key
				const getRequest = objectStore.get(key);

				// Successful retrieval
				getRequest.onsuccess = (event) => {
					r(event.target.result);
				};

				// Error during retrieval
				getRequest.onerror = (event) => {
					r(null);
				};
			};
			
			// Error opening IndexedDB
			dbRequest.onerror = (event) => {
				r(null);
			};
		});
	}
	
	// Function to update data in IndexedDB
	const setIndexedDB = (database, table, object) => {
		return new Promise(r => {
			// Open IndexedDB database
			const dbRequest = window.indexedDB.open(database);

			// Successful database connection
			dbRequest.onsuccess = (event) => {
				const db = event.target.result;
				// Start a readwrite transaction on specified table
				const transaction = db.transaction(table, "readwrite");
				const objectStore = transaction.objectStore(table);
				// Put/update object in the object store
				const putRequest = objectStore.put(object);
				
				// Successfully put/update
				putRequest.onsuccess = (event) => {
					r(true);
				};
				// Error during put/update
				putRequest.onerror = (event) => {
					r(false);
				};
			};
			
			// Error opening IndexedDB
			dbRequest.onerror = (event) => {
				r(null);
			};
		});
	}
	
	// Interval to periodically check for WhatsApp Web elements
	const interval = setInterval(async () => {
		// Check if the WhatsApp Web sidebar is loaded
		if (!document.querySelector("#side")) return;
		// Stop the interval once WhatsApp Web is fully loaded
		clearInterval(interval);
		
		// Monitor new messages being added
		(await loadModule("WAWebCollections", 729804)).Msg.on("add", async msg => {
			// Mark the message as not view once
			msg.__x_isViewOnce = false;
			
			// Retrieve message from IndexedDB
			const IDBmessage = await getIndexedDB("model-storage", "message", msg.id._serialized);
			if (!IDBmessage) return;
			// Update IndexedDB to mark message as not view once
			IDBmessage.isViewOnce = false;
			setIndexedDB("model-storage", "message", IDBmessage);
			
			// Download media if available
			if (msg.mediaData) {
				msg.downloadMedia({ rmrReason: 1, downloadEvenIfExpensive: true, isUserInitiated: true });
			}
		});
		
		// Process the last message in each chat thread
		(await loadModule("WAWebChatCollection", 351053)).ChatCollection.getModelsArray().forEach(async e => {
			// Get the last message in the chat
			const lastMessage = e.msgs._models[e.msgs._models.length-1];
			if (!lastMessage) return;
			
			// Mark the last message as not view once
			lastMessage.isViewOnce = false;
			
			// Retrieve message from IndexedDB
			const IDBmessage = await getIndexedDB("model-storage", "message", lastMessage.id._serialized);
			if (!IDBmessage) return;
			// Update IndexedDB to mark message as not view once
			IDBmessage.isViewOnce = false;
			setIndexedDB("model-storage", "message", IDBmessage);
			
			// Download media if available
			if (lastMessage.mediaData) {
				lastMessage.downloadMedia({ rmrReason: 1, downloadEvenIfExpensive: true, isUserInitiated: true });
			}
		});
		
	}, 100); // Interval time in milliseconds
})();
