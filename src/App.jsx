import { useEffect, useState } from "react";
import Papaparse from "papaparse";
import "./App.css";

function App() {
  const [extractedData, setExtractedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allFilters, setAllFilters] = useState({
    category: "",
    brand: "",
    discounted: "",
  });
  const [sortingBy, setSortingBy] = useState("");
  const [sortingOrder, setSortingOrder] = useState("asc");

  useEffect(() => {
    const dataSet = localStorage.getItem("data_set");
    if (dataSet) {
      setExtractedData(JSON.parse(dataSet));
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papaparse.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          localStorage.setItem("data_set", JSON.stringify(results.data));
          setExtractedData(results.data);
          setFilteredData(results.data);
        },
      });
    } else if (file.name.endsWith(".json")) {
      reader.onload = (event) => {
        const jsonData = JSON.parse(event.target.result);
        localStorage.setItem("data_set", JSON.stringify(jsonData));
        setExtractedData(jsonData);
        setFilteredData(jsonData);
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

        if (sortingBy === "price" || sortingBy === "rating") {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else {
          valA = valA?.toString().toLowerCase();
          valB = valB?.toString().toLowerCase();
        }

        if (valA < valB) return sortingOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortingOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(data);
  }, [allFilters, sortingBy, sortingOrder, extractedData]);

  const onClearData = () => {
    localStorage.removeItem("data_set");
    setExtractedData([]);
    setFilteredData([]);
    setAllFilters({
      category: "",
      brand: "",
      discounted: "",
    });
    setSortingBy("");
  }

  return (
    <div>
      {extractedData.length === 0 ? (
        <section className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Upload Your Data File Here .csv or .json
          </h2>
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <span className="flex w-[24px] ml-2 h-[24px] items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-4 4m4-4l4 4"
                />
              </svg>
            </span>
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                Drop your file here or{" "}
              </span>
              <span className=" underline">Browse</span>
            </p>
            <p className="text-xs text-gray-400">Maximum file size 50mb</p>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </section>
      ) : (
        <section>
          <div className="flex justify-between items-center space-x-4 ">
            <div className="flex space-x-4">
              <select
                className="py-2 px-4 rounded-[10px] border-2 border-gray-800"
                onChange={(e) =>
                  setAllFilters({ ...allFilters, category: e.target.value })
                }
              >
                <option value="">Categories</option>
                {[...new Set(extractedData.map((item) => item.category))].map(
                  (cat) => (
                    <option key={cat}>{cat}</option>
                  )
                )}
              </select>
              <select
                className="py-2 px-4 rounded-[10px] border-2 border-gray-800"
                onChange={(e) =>
                  setAllFilters({ ...allFilters, brand: e.target.value })
                }
              >
                <option value="">Brands</option>
                {[...new Set(extractedData.map((item) => item.brand))].map(
                  (brand) => (
                    <option key={brand}>{brand}</option>
                  )
                )}
              </select>
              <select
                className="py-2 px-4 rounded-[10px] border-2 border-gray-800"
                onChange={(e) =>
                  setAllFilters({ ...allFilters, discounted: e.target.value })
                }
              >
                <option value="">Discounted</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex space-x-4 items-center">
              <label className="text-[14px]" htmlFor="">
                Sort by:
              </label>
              <select
                className="py-2 px-4 rounded-[10px] border-2 border-gray-800"
                onChange={(e) => setSortingBy(e.target.value)}
              >
                <option value="">None</option>
                <option value="product_name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
              {/*<button className="py-2 px-4 rounded-bl border-2 border-gray-800" onClick={() => setSortingOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))} >*/}
              {/*  Order ({sortingOrder})*/}
              {/*</button>*/}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={sortingOrder === "asc"}
                  className="sr-only peer"
                  onClick={() =>
                    setSortingOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Order {sortingOrder}
                </span>
              </label>
              <button onClick={onClearData} className="p-2 bg-white rounded-full text-red-400 hover:text-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200">Clear </button>
            </div>
          </div>

          <div className="mt-8">
            <table className="min-w-full table-auto border-collapse text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  {filteredData.length > 0 &&
                    Object.keys(filteredData[0]).map((key) => (
                      <th className="p-4" key={key}>
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr className="border-b" key={idx}>
                    {Object.values(item).map((val, i) => (
                      <td className="p-4 text-xs" key={i}>
                        {val?.toString().startsWith("http") ? (
                          <img
                            src={val}
                            alt="img"
                            width="50"
                            height="50"
                            className="rounded-full"
                          />
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
        </section>
      )}
    </div>
  );
}

export default App;
