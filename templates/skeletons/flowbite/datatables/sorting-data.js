if (document.getElementById("sorting-table") && typeof simpleDatatables.DataTable !== 'undefined') {
    const dataTable = new simpleDatatables.DataTable("#sorting-table", {
        searchable: false,
        perPageSelect: false,
        sortable: true
    });
}
