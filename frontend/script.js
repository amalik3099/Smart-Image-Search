$(document).ready(function () { 
    $(".custom-file-input").on("change", function () {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });    
})


var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var search_query = document.getElementById('search_query');

function speech_recognition() {
    search_query = document.getElementById('search_query');
    console.log(search_query);
    recognition.start();
    console.log('Ready to receive a command.');
}

recognition.onresult = function(event) {
    var speech_input = event.results[0][0].transcript;
    search_query.value = speech_input;
    console.log('Confidence: ' + event.results[0][0].confidence);
}

recognition.onspeechend = function() {
    recognition.stop();
}
  
recognition.onnomatch = function(event) {
    search_query.value = "";
}
  
recognition.onerror = function(event) {
    search_query.value = "";
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }



function image_preview() {
    inputFile = document.getElementById('inputFile');
    preview_image = document.getElementById("preview_image");
    const [file] = inputFile.files
    console.log(inputFile.files);
    if (file) {
        console.log(URL.createObjectURL(file));
        preview_image.src = URL.createObjectURL(file)
    }
}


// function getBase64(file) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       // reader.onload = () => resolve(reader.result)
//       reader.onload = () => {
//         let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
//         if ((encoded.length % 4) > 0) {
//           encoded += '='.repeat(4 - (encoded.length % 4));
//         }
//         resolve(encoded);
//       };
//       reader.onerror = error => reject(error);
//     });
//   }


function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

// function getBase64(file) {
//     var reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = function () {
//       console.log(reader.result);
//     };
//     reader.onerror = function (error) {
//       console.log('Error: ', error);
//     };
//  }
 
//  var file = document.querySelector('#files > input[type="file"]').files[0];
//  getBase64(file);
  
  
  
function uploadImage()
{
    // var file_data = $("#file_path").prop("files")[0];
    var file = document.getElementById('inputFile').files[0];
    const reader = new FileReader();

    var file_data;
    // var file = document.querySelector('#file_path > input[type="file"]').files[0];
    var encoded_image = getBase64(file).then(
    data => {
    console.log(data)
    // var data = document.getElementById('file_path').value;
    // var x = data.split("\\")
    // var filename = x[x.length-1]
    var file_type = file.type;
    console.log("file.type: ",file.type)
    console.log("file_type: ",file_type)
    var file_name = uuidv4() + '.jpg';

    var body = data;
    var params = {"filename" : file_name, "bucket" : "octavius-photos", "Content-Type" : "image/jpeg", "customlabels" : ""};
    var additionalParams = {};
    var apigClient = apigClientFactory.newClient({
    apiKey: 'wxI1Wedpmq6GKPc8xefAa89mXbEdMIY7ajr0iiFk'});
    apigClient.photosBucketFilenamePut(params, body , additionalParams).then(function(res){
        if (res.status == 200)
        {
            console.log(file.mozFullPath);
            console.log("Original File Name: " + file.name);
            console.log("File Name: " + file_name);
            console.log("Image Uploaded!!!!");
        }
        else {
            console.log(res.status);
        }
    })
    });

}

function searchImages() 
{

    var searched_photos = document.getElementById("searched_photos");
    var img = document.createElement("img");
    img.src = "/home/aadilmehdi/Pictures/Screenshot from 2021-03-20 17-44-01.png";
    searched_photos.appendChild(img);

    var search_query_val = document.getElementById('search_query').value;
    var params = {"q":search_query_val};
    var additionalParams = {};
    var body = "";
    var apigClient = apigClientFactory.newClient({
    apiKey: 'wxI1Wedpmq6GKPc8xefAa89mXbEdMIY7ajr0iiFk'});
    apigClient.searchGet(params, body , additionalParams).then(function(res){
        if (res.status == 200)
        {
            console.log(res)
        // document.getElementById("uploadText").innerHTML = "Image Uploaded  !!!"
        // document.getElementById("uploadText").style.display = "block";
        }
        else {
            console.log(res.status);
        }
    })
}
