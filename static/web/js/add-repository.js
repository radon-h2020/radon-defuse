function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// SVC = Supported Version Control system
var SVC = ['github', 'gitlab']

$("#dropdown-svc-item").click(function(){
  svc_item = $("#dropdown-svc-item").text().trim().toLowerCase()
  index = SVC.indexOf(svc_item)

  $("#dropdown-svc-button").html(capitalizeFirstLetter(SVC[index]))
  $("#dropdown-svc-item").html(capitalizeFirstLetter(SVC[(index+1) % 2]))
  $("#svc-api-token-description").html("This is the personal token to access the " + capitalizeFirstLetter(SVC[index]) + " APIs")

  if(index == 0){ // github
    $("#input-svc-identifier").attr("placeholder", "https://github.com/<owner>/<name>");
    $("#svc-identifier-description").html("This is the url to the Github repository.")
  }else{ // gitlab
    $("#input-svc-identifier").attr("placeholder", "Project ID");
    $("#svc-identifier-description").html("This is unique identifier of the Gitlab project.")
  }
});

$("#input-svc-identifier").keyup(function(){
    $("#alert-missing-svc").hide()
})

$("#input-svc-api-token").keyup(function(){
    $("#alert-missing-token").hide()
})


