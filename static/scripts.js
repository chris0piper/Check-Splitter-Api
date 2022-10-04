// scripts.js

function getPhoto(){
    const fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', (e) =>
      doSomethingWithFiles(e.target.files),
    );

};



//     for (let i = 0; i < fileList.length; i++) {
//         if (fileList[i].type.match(/^image\//)) {
//           file = fileList[i];
//           break;
//         }
//     }
  
//     if (file !== null) {
//         let src = URL.createObjectURL(file);
//         console.log("did i make it this far?")
//         console.log(src)

//     }
    
// };
