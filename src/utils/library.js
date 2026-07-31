export const libraryService = {
  /**
   * Fetches the central library categories
   * @param {string} apiUrl Optional Central API URL. If empty, defaults to local library-api.php.
   */
  async getCategories(apiUrl) {
    const targetUrl = (apiUrl && apiUrl.trim() !== '') 
      ? apiUrl 
      : import.meta.env.BASE_URL + 'library-api.php';
      
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Failed to fetch from Central Library API:', err);
      throw new Error(err.message || 'API unreachable', { cause: err });
    }
  },

  /**
   * Publishes a category version to the central library
   * @param {string} apiUrl Optional Central API URL. If empty, defaults to local library-api.php.
   * @param {object} categoryData The category data to publish
   */
  async publishCategory(apiUrl, categoryData) {
    const targetUrl = (apiUrl && apiUrl.trim() !== '') 
      ? apiUrl 
      : import.meta.env.BASE_URL + 'library-api.php';

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      if (!response.ok) {
        const errMsg = await response.json().catch(() => ({}));
        throw new Error(errMsg.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Failed to publish to Central Library API:', err);
      throw new Error(err.message || 'API unreachable', { cause: err });
    }
  }
};
