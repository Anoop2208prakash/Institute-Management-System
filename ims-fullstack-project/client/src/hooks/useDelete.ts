// client/src/hooks/useDelete.ts
import { useState, useCallback } from 'react';

/**
 * Custom Hook for handling delete operations
 * @param refreshData - Function to reload the list after successful delete
 */
export const useDelete = (refreshData: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = useCallback(async (url: string) => {
    if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        refreshData(); // Refresh the parent list
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Network Error: Could not delete item.");
    } finally {
      setIsDeleting(false);
    }
  }, [refreshData]);

  return { deleteItem, isDeleting };
};