import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [extractedData, setExtractedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allFilters, setAllFilters] = useState({
    category: '',
    brand: '',
    discounted: '',
  });
  const [sortingBy, setSortingBy] = useState('');
  const [sortingOrder, setSortingOrder] = useState('asc');

  useEffect(() => {
    const dataSet = localStorage.getItem('data_set');
    if (dataSet) {
      setExtractedData(JSON.parse(dataSet));
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papaparse.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          localStorage.setItem('data_set', JSON.stringify(results.data));
          setExtractedData(results.data);
          setFilteredData(results.data)
        },
      });
    } else if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        const jsonData = JSON.parse(event.target.result);
        localStorage.setItem('data_set', JSON.stringify(jsonData));
        setExtractedData(jsonData);
        setFilteredData(jsonData)
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    let data = [...extractedData];

    // Filter
    if (allFilters.category)
      data = data.filter((item) => item.category === allFilters.category);

    if (allFilters.brand)
      data = data.filter((item) => item.brand === allFilters.brand);

    if (allFilters.discounted)
      data = data.filter(
        (item) =>
          String(item.is_discounted).toLowerCase() ===
          allFilters.discounted.toLowerCase()
      );

    // Sort
    if (sortingBy) {
      data.sort((a, b) => {
        let valA = a[sortingBy];
        let valB = b[sortingBy];

        if (sortingBy === 'price' || sortingBy === 'rating') {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else {
          valA = valA?.toString().toLowerCase();
          valB = valB?.toString().toLowerCase();
        }

        if (valA < valB) return sortingOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortingOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(data);
  }, [allFilters, sortingBy, sortingOrder, extractedData]);  

  return (
    <div>
      <h2 className='text-3xl font-bold underline'>Upload Your Data File Here .csv or .json</h2>
      <input type="file" accept=".csv,.json" onChange={handleFileUpload} />
      <div>
        <select onChange={(e) => setAllFilters({ ...allFilters, category: e.target.value })}>
          <option value="">Categories</option>
          {[...new Set(extractedData.map((item) => item.category))].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select onChange={(e) => setAllFilters({ ...allFilters, brand: e.target.value })} >
          <option value="">Brands</option>
          {[...new Set(extractedData.map((item) => item.brand))].map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>

        <select onChange={(e) => setAllFilters({ ...allFilters, discounted: e.target.value })} >
          <option value="">Discounted?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <label>Sort by:</label>
        <select
          onChange={(e) => setSortingBy(e.target.value)}
          
        >
          <option value="">None</option>
          <option value="product_name">Name</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>

        <button onClick={() => setSortingOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))} >
          Order ({sortingOrder})
        </button>
      </div>

      <div>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              {filteredData.length > 0 &&
                Object.keys(filteredData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx}>
                {Object.values(item).map((val, i) => (
                  <td key={i}>
                    {val?.toString().startsWith('http') ? (
                      <img src={val} alt="img" width="50" />
                    ) : (
                      val
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
