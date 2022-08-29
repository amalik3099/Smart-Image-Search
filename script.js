$(document).ready(function () { 
    $(".custom-file-input").on("change", function () {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
    $("#upload_status").hide();
    // $("#no_images").hide();   
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
    var file_type = file.type + ";base64" ;
    console.log("file.type: ",file.type);
    console.log("file_type: ",file_type);
    console.log(file.type + ";base64");
    console.log("Hello");
    var file_name = uuidv4() + '.jpg';

    var body = data;
    var params = {"filename" : file_name, "bucket" : "octavius-photos", "Content-Type" : file_type, "customlabels" : ""};
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
            $("#upload_status").show()
        }
        else {
            console.log(res.status);
            $("#upload_status").hide()
        }
    })
    });

}

function searchImages() 
{
    $("#searched_photos").empty();
    var search_query_val = document.getElementById('search_query').value;
    var params = {"q":search_query_val};
    var additionalParams = {};
    var body = "";
    var apigClient = apigClientFactory.newClient({
    apiKey: 'wxI1Wedpmq6GKPc8xefAa89mXbEdMIY7ajr0iiFk'});
    apigClient.searchGet(params, body , additionalParams).then(function(res){
        console.log(res.status)
        if (res.status == 200)
        {
            if (typeof(res.data) != "object") {
                $("#no_images").show();  
            }
            else{
                $("#no_images").hide();  
                var searched_photos = document.getElementById("searched_photos");
                console.log(res)
                console.log(res.data)
                var limit = Math.min(res.data.length, 6);
                for (let i = 0; i < limit; i++) {
                    console.log(res.data[i]);
                    var img = document.createElement("img");
                    img.src = res.data[i];
                    img.id = "temp_pic";
                    searched_photos.appendChild(img);
                }
            }

            // var searched_photos = document.getElementById("searched_photos");
            // var img = document.createElement("img");
            // img.src = "/home/aadilmehdi/Pictures/Screenshot from 2021-03-20 17-44-01.png";
            // searched_photos.appendChild(img);
        // document.getElementById("uploadText").innerHTML = "Image Uploaded  !!!"
        // document.getElementById("uploadText").style.display = "block";
        }
        else {
            $("#no_images").show();  
        }
    })
    .catch(function(error) {
        $("#no_images").show(); 
    })
}



function uploadPhoto() {
    var filePath = (document.getElementById('inputFile').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    console.log(filePath);
    
    if (!document.getElementById('custom_labels').innerText == "") {
        var customLabels = document.getElementById('custom_labels');
    }
    console.log(fileName);
    console.log(custom_labels.value);

    var reader = new FileReader();
    var file = document.getElementById('inputFile').files[0];
    console.log('File : ', file);
    document.getElementById('inputFile').value = "";
    var apigClient = apigClientFactory.newClient({
        apiKey: 'wxI1Wedpmq6GKPc8xefAa89mXbEdMIY7ajr0iiFk'});

    if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(fileName.split(".")[1]))) {
        alert("Please upload a valid .png/.jpg/.jpeg file!");
    } else {

        var params = {
            "filename" : fileName, 
            "bucket" : "octavius-photos", 
            "Content-Type" : file.type, 
            "customlabels" : custom_labels.value};

        var additionalParams = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': file.type
            }
        };
        
        reader.onload = function (event) {
            body = btoa(event.target.result);
            console.log('Reader body : ', body);
            return apigClient.photosBucketFilenamePut(params, body, additionalParams)
            .then(function(result) {
                console.log(result);
                $("#upload_status").show();
            })
            .catch(function(error) {
                console.log(error);
                $("#upload_status").hide();
            })
        }
        reader.readAsBinaryString(file);
    }
}