import Catalog from '../components/Catalog';
import { getProducts } from '../lib/catalog';

export const revalidate = 300; // refresh sheet data every 5 minutes

export default async function Page() {
  let products = [];
  try {
    products = await getProducts();
  } catch (e) {
    console.error('Could not load catalog:', e.message);
  }
  return <Catalog products={products} phone={process.env.WHATSAPP_NUMBER || ''} />;
}
