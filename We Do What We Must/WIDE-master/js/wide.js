var x = 0;
var keywordArray = Array();

function add_element_to_array()
{
 keywordArray[x] = document.getElementById("text1").value;
 display_array();
 x++;
 document.getElementById("text1").value = "";
}

function display_array()
{
   var e = "<br/>";
    
   for (var y=0; y<keywordArray.length; y++)
   {
     e += y + ": " + keywordArray[y] + "<br/>";
   }
   document.getElementById("Result").innerHTML = e;
}


