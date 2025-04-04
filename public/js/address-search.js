class AddressSearch {
    constructor(options = {}) {
      this.apiProvider = options.apiProvider || 'nominatim'; // Default to OpenStreetMap's Nominatim
      this.inputSelector = options.inputSelector || '#address-search';
      this.resultSelector = options.resultSelector || '#address-results';
      this.latInputSelector = options.latInputSelector || '#form-lat';
      this.lngInputSelector = options.lngInputSelector || '#form-lng';
      this.searchDelay = options.searchDelay || 500; // ms delay for fuzzy search
      this.minChars = options.minChars || 3; // Minimum characters before searching
      
      this.searchTimeout = null;
      this.lastQuery = '';
      this.selectedResult = null;
      
      this.init();
    }
    
    init() {
      const inputEl = document.querySelector(this.inputSelector);
      if (!inputEl) {
        console.error(`Address search input element not found: ${this.inputSelector}`);
        return;
      }
      
      // Create results container if it doesn't exist
      let resultsEl = document.querySelector(this.resultSelector);
      if (!resultsEl) {
        resultsEl = document.createElement('div');
        resultsEl.id = this.resultSelector.replace('#', '');
        resultsEl.className = 'address-results';
        resultsEl.style.display = 'none';
        resultsEl.style.position = 'absolute';
        resultsEl.style.zIndex = '1000';
        resultsEl.style.backgroundColor = '#fff';
        resultsEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        resultsEl.style.borderRadius = '4px';
        resultsEl.style.width = '100%';
        resultsEl.style.maxHeight = '200px';
        resultsEl.style.overflowY = 'auto';
        
        inputEl.parentNode.style.position = 'relative';
        inputEl.parentNode.appendChild(resultsEl);
      }
      
      // Set up input event listener for fuzzy search
      inputEl.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        
        // Hide results if query is too short
        if (query.length < this.minChars) {
          resultsEl.style.display = 'none';
          return;
        }
        
        // Set timeout for search to avoid too many requests
        this.searchTimeout = setTimeout(() => {
          if (query !== this.lastQuery) {
            this.lastQuery = query;
            this.searchAddress(query);
          }
        }, this.searchDelay);
      });
      
      // Close results when clicking outside
      document.addEventListener('click', (e) => {
        if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
          resultsEl.style.display = 'none';
        }
      });
    }
    
    async searchAddress(query) {
      const resultsEl = document.querySelector(this.resultSelector);
      
      try {
        let results = [];
        
        switch (this.apiProvider) {
          case 'nominatim':
            results = await this.searchNominatim(query);
            break;
          // Add more providers if needed
          default:
            results = await this.searchNominatim(query);
        }
        
        this.displayResults(results);
      } catch (error) {
        console.error('Error searching address:', error);
        resultsEl.innerHTML = '<div class="address-result-error">Erreur lors de la recherche</div>';
        resultsEl.style.display = 'block';
      }
    }
    
    async searchNominatim(query) {
      // Use OpenStreetMap Nominatim API (free and no API key required)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      return await response.json();
    }
    
    displayResults(results) {
      const resultsEl = document.querySelector(this.resultSelector);
      
      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="address-result-item">Aucun résultat trouvé</div>';
        resultsEl.style.display = 'block';
        return;
      }
      
      resultsEl.innerHTML = '';
      
      results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'address-result-item';
        resultItem.style.padding = '8px 12px';
        resultItem.style.cursor = 'pointer';
        resultItem.style.borderBottom = '1px solid #eee';
        resultItem.style.hoverBgColor = '#f5f5f5';
        
        // Format display name based on provider
        let displayName = result.display_name || result.name || result.formatted_address || 'Adresse';
        
        resultItem.textContent = displayName;
        
        // Add hover effect
        resultItem.addEventListener('mouseover', () => {
          resultItem.style.backgroundColor = '#f5f5f5';
        });
        
        resultItem.addEventListener('mouseout', () => {
          resultItem.style.backgroundColor = '';
        });
        
        // Set coordinates when result is clicked
        resultItem.addEventListener('click', () => {
          this.selectResult(result);
        });
        
        resultsEl.appendChild(resultItem);
      });
      
      resultsEl.style.display = 'block';
    }
    
    selectResult(result) {
      const inputEl = document.querySelector(this.inputSelector);
      const resultsEl = document.querySelector(this.resultSelector);
      const latInput = document.querySelector(this.latInputSelector);
      const lngInput = document.querySelector(this.lngInputSelector);
      
      // Store the selected result
      this.selectedResult = result;
      
      // Set input value to the result's display name
      inputEl.value = result.display_name || result.name || result.formatted_address || 'Adresse sélectionnée';
      
      // Set coordinates in the hidden inputs
      if (latInput && lngInput) {
        latInput.value = result.lat || (result.geometry ? result.geometry.location.lat() : '');
        lngInput.value = result.lon || (result.geometry ? result.geometry.location.lng() : '');
      }
      
      // Hide results
      resultsEl.style.display = 'none';
      
      // Optional: trigger a custom event for integration with other components
      const event = new CustomEvent('addressSelected', { detail: result });
      inputEl.dispatchEvent(event);
    }
  }
  
  // Export for use in other scripts
  window.AddressSearch = AddressSearch;