const LANGUAGES = ['ansible', 'tosca']

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$("#dropdown-mine-language-item").click(function(){
  item = $("#dropdown-mine-language-item").text().trim().toLowerCase()
  index = LANGUAGES.indexOf(item)

  $("#dropdown-mine-language-btn").html('&nbsp;' + capitalizeFirstLetter(LANGUAGES[index]))
  $("#dropdown-mine-language-item").html(capitalizeFirstLetter(LANGUAGES[(index+1) % 2]))
});