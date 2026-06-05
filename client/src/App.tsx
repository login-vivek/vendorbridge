import { useEffect, useState } from 'react';

interface Vendor {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetch('/api/vendors')
      .then((response) => response.json())
      .then(setVendors)
      .catch(console.error);
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Vendor Bridge</h1>
      </header>

      <main>
        <section>
          <h2>Vendors</h2>
          <ul>
            {vendors.map((vendor) => (
              <li key={vendor.id}>
                <strong>{vendor.name}</strong> <span>{vendor.email}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
