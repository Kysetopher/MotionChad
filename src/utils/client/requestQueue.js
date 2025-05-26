class RequestQueue {
  constructor() {
    this.queue = [];
    this.isReady = false;

    if (typeof window !== 'undefined') { // Ensure this runs in the browser
      try {
        this.queue = JSON.parse(localStorage.getItem('requestQueue')) || [];
        this.isReady = true;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        // Handle the error (e.g., fallback to an empty queue)
        this.queue = [];
      }

      this.processQueue();
      window.addEventListener('online', () => this.processQueue());
    }
  }

  addRequest(requestConfig) {
    this.queue.push(requestConfig);

    if (this.isReady) {
      try {
        localStorage.setItem('requestQueue', JSON.stringify(this.queue));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  async processQueue() {
    const endpointMapping = {
      'apisupabase//updateReverie': 'api/supabase/getReverie',
    };
  
    if (navigator.onLine && this.queue.length > 0) {
      for (let i = 0; i < this.queue.length; i++) {
        const request = this.queue[i];
        console.log('Sending request:', request);
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });
          if (response.ok) {
            console.log('Request succeeded:', response);
  
            // Determine the cache update URL using the mapping
            const updateUrl = endpointMapping[request.url] || request.url;
  
            // Notify the service worker to update the cache
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_CACHE',
                url: updateUrl,
                data: await response.clone().json(), // Assuming JSON response
              });
            }
  
            // Remove the request from the queue
            this.queue.splice(i, 1);
            i--; // Adjust index due to item removal
          } else {
            throw new Error(response.statusText || 'Request failed');
          }
        } catch (error) {
          console.error('Request', request, 'failed:', error);
        }
      }
  
      // Save the updated queue to localStorage
      try {
        localStorage.setItem('requestQueue', JSON.stringify(this.queue));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }
  
  async queueFetch(url, method, headers, body) {
    const requestConfig = { url, method, headers, body };

    if (!navigator.onLine) {
      

      if (url.includes('/api/supabase/updateReverie')) {
        try {
          const { revId, updatedData } = JSON.parse(body); 
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'UPDATE_CACHE',
              url: '/api/supabase/fetchAllCards',
              id: revId,
              updatedData,
            });
            // console.log("ID",revId,"CardData",updatedData , 'Reverie Updated when Offline : Service worker notified to update cache.');
          } else {
            console.warn('No active service worker to handle cache update.');
          }
        } catch (error) {
          console.error('Failed to parse updateReverie payload for cache update:', error);
        }
      }
      console.log('Offline: Adding request to queue:', url,JSON.parse(body));
      this.addRequest(requestConfig);

    } else {

      try {
        const response = await fetch(url, { method, headers, body });
        if (!response.ok) throw new Error('Request failed');
        console.log('Request succeeded:', response);
      } catch (error) {

        console.error('Request failed while online:', url,JSON.parse(body));
        
      }
    }
  }
}

// Initialize requestQueue only in the browser environment
let requestQueue = null;

if (typeof window !== 'undefined') {
  try {
    requestQueue = new RequestQueue();
  } catch (error) {
    console.error('Error initializing RequestQueue:', error);
  }
} else {
  console.log('RequestQueue is not being initialized because this is not a browser environment');
}

export default requestQueue;