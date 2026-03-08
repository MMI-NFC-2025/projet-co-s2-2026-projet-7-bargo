const PB_URL = 'https://pbbargo.pierre-mouilleseaux-lhuillier.fr';

/**
 * Construit l'URL d'une image PocketBase.
 * @param {Object} record - L'enregistrement PocketBase (doit contenir collectionName et id)
 * @param {string} filename - Le nom du fichier image
 */
export function getImageUrl(record, filename) {
  return `${PB_URL}/api/files/${record.collectionName}/${record.id}/${filename}`;
}

/**
 * Récupère tous les enregistrements d'une collection PocketBase.
 * @param {string} collection - Nom de la collection
 * @param {Object} params - Paramètres optionnels (sort, filter, expand…)
 * @returns {Promise<Array>} Liste des enregistrements
 */
export async function getCollection(collection, params = {}) {
  const query = new URLSearchParams({ perPage: 50, ...params });
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${query}`);
  const data = await res.json();
  return data.items ?? [];
}

/**
 * Récupère un seul enregistrement par son ID.
 * @param {string} collection - Nom de la collection
 * @param {string} id - ID de l'enregistrement
 */
export async function getRecord(collection, id) {
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`);
  return await res.json();
}
