const dropdown = FlowbiteInstances.getInstance('Dropdown', 'dropdownTimepicker');
const $saveTimeButton = document.getElementById('saveTimeButton');

$saveTimeButton.addEventListener('click', function() {
    // save time code and then hide the dropdown
    dropdown.hide();
});
