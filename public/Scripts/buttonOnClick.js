
//LAU Kwan Kit
//301256503
//January 2023
var form = document.getElementById("form");
document.getElementById("submit").addEventListener ("click", checkInput);

function checkInput(e) {
e.preventDefault()
var elements = document.getElementById("form").elements;
var obj ="";
for(var i = 0 ; i < elements.length ; i++){
    var item = elements.item(i);
    obj = obj + " " + item.name + ": " +  item.value + "\n";
}
alert(obj); // print alert
HTMLFormElement.prototype.submit.call(form)  //submit form
document.location.href="/"; //redirect to homepage
}

