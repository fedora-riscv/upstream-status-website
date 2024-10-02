import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-quartz.css";
import './App.css';

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columnDefs = [
    { headerName: 'Name', field: 'package', sortable: true, filter: true },
    { headerName: 'NVR', field: 'latest NVR', sortable: true, filter: true },
    { headerName: 'Action', field: 'action', sortable: true, filter: true },
    { headerName: 'Owner', field: 'owner_name', sortable: true, filter: true },
    {
      headerName: 'Source', field: 'source',
      // cellRenderer: (params) => {
      //   if (params.value) {
      //     if (params.value.startsWith('git+https://github.com/fedora-riscv/')) {
      //       const url = params.value.replace(/^git\+/, '');
      //       return (
      //         <a href={url} target="_blank" rel="noopener noreferrer">
      //           Fedora-V Force
      //         </a>
      //       );
      //     } else if (params.value.startsWith('git+http://fedora.riscv.rocks:3000/')) {
      //       const url = params.value.replace(/^git\+/, '');
      //       return (
      //         <a href={url} target="_blank" rel="noopener noreferrer">
      //           Rocks
      //         </a>
      //       );
      //     }
      //   }
      //   return params.value;
      // },
      sortable: true,
      filter: true
    },
    {
      headerName: 'Build Link',
      field: 'build_link',
      cellRenderer: (params) => {
        if (params.value) {
          const match = params.value.match(/buildID=(\d+)$/);
          const buildId = match ? match[1] : 'Link';
          return (
            <a href={params.value} target="_blank" rel="noopener noreferrer">
              {buildId}
            </a>
          );
        }
        return null;
      },
      sortable: true,
      filter: true
    },
    { 
      headerName: 'Note', 
      field: 'note', 
      sortable: false, 
      filter: false,
      cellRenderer: (params) => {
        if (params.value) {
          // Replace pull request URLs with "PR" label
          const prRegex = /https:\/\/src\.fedoraproject\.org\/[^/]+\/[^/]+\/pull-request\/\d+/g;
          const replacedText = params.value.replace(prRegex, '<a href="$&" target="_blank" rel="noopener noreferrer">PR</a>');
          
          // Use dangerouslySetInnerHTML to render the HTML
          return <span dangerouslySetInnerHTML={{ __html: replacedText }} />;
        }
        return params.value;
      }
    }
  ];

  const getRowClass = (params) => {
    switch (params.data.action) {
      case 'TODO':
        return 'row-todo';
      case 'NO NEED':
        return 'row-no-need';
      case 'ONGOING':
        return 'row-ongoing';
      case 'DONE':
        return 'row-done';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxzB7HYmzInmn1XgvwL1P8ZAYHvJFIMOaYkuuaECtePSvJWcUSmHQeWObb4EbR2JTbb/exec');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRowData(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Fedora on RISC-V Upstream Status</h1>
      <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight'
          getRowClass={getRowClass}
          enableCellTextSelection={true}
          autoSizeStrategy={{
            type: 'fitGridWidth',
            defaultMinWidth: 100,
            columnLimits: [
              {
                colId: 'action',
                maxWidth: 100
              },
              {
                colId: 'build_link',
                maxWidth: 150
              }
            ]
          }}
        />
      </div>
    </div>
  );
};

export default App;
