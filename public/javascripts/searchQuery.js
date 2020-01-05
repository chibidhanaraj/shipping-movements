let columnSearchValue = 1;

const searchQuery = () => {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[columnSearchValue];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
}

const selectSearchByType = () => {
    var buttonValue, searchBoxPlaceholder;
    buttonValue = document.getElementsByName('selectSearchType');
    searchBoxPlaceholder = document.getElementById('myInput');
    innerContentText = document.getElementsByClassName('radioHeader')
    for (i = 0; i < buttonValue.length; i++) {
        if (buttonValue[i].checked) {
            columnSearchValue = buttonValue[i].value;
            resetSearchQuery();
            searchBoxPlaceholder.placeholder = (columnSearchValue === 'all') ? 'Search for names...' : innerContentText[i].innerText;
            searchBoxPlaceholder.value = '';
        }
      }
}

const resetSearchQuery = () => {
    var table, tr, i;
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
        tr[i].style.display = "";   
    }
}