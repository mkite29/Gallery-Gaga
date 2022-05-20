(function(){
    let saveAlbum = document.querySelector("#saveAlbum");
    let addAlbum = document.querySelector("#addAlbum");
    let deleteAlbum = document.querySelector("#deleteAlbum");
    let importAlbum = document.querySelector("#importAlbum");
    let exportAlbum = document.querySelector("#exportAlbum");
    let playAlbum = document.querySelector("#playAlbum");
    let selectAlbum = document.querySelector("#selectAlbum");
    let allTemplates = document.querySelector("#allTemplates");
    let overlay = document.querySelector("#overlay");
    let playOverlay = document.querySelector("#play-overlay");
    let contentDetailsOverlay = document.querySelector("#content-details-overlay");
    let newSlide = document.querySelector("#new-slide");
    let createSlide = document.querySelector("#create-slide");
    let showSlide = document.querySelector("#show-slide");
    let btnSaveSlide = document.querySelector("#btnSaveSlide");
    let txtSlideImage = document.querySelector("#txtSlideImage");
    let txtSlideTitle = document.querySelector("#txtSlideTitle");
    let slideList = document.querySelector("#slide-list");
    let txtSlideDesc = document.querySelector("#txtSlideDesc");
    let uploadFile = document.querySelector("#uploadFile");

    // let albums = [{
    //     name: "test",
    //     slides: []
    // }];

    let albums = [];

    addAlbum.addEventListener("click", handleAddAlbum);
    selectAlbum.addEventListener("change", handleSelectAlbum);
    newSlide.addEventListener("click", handleNewSlideClick);
    btnSaveSlide.addEventListener("click", handleSaveSlide);
    saveAlbum.addEventListener("click", saveToLocalStorage); 
    deleteAlbum.addEventListener("click", handleDeleteAlbum);
    exportAlbum.addEventListener("click",handleExportAlbum);
    
    // main to jo upload file wala button hai upload ke click usi per ker rahe hai
    //per baad mei uske click per import button ka click trigger kerwa dengei.
    importAlbum.addEventListener("click",function(){
        uploadFile.click();
    });
    

    uploadFile.addEventListener("change", handleImportAlbum);
    playAlbum.addEventListener("click", handlePlayAlbum);

    function handleExportAlbum(){
        let album = albums.find(a => a.name == selectAlbum.value);
        let ajson = JSON.stringify(album);
        let encodedJson = encodeURIComponent(ajson);

        //anchore tag banaya hai iska ek format hota hai.
        let a = document.createElement("a");
        a.setAttribute("download",album.name + ".json");

        // ye format hota hai 
        a.setAttribute("href", "data:text/json; charset=utf-8, " + encodedJson);


        a.click();
    }

    function handleImportAlbum(){
        // alert("Hi, Hello");check kerne kei loye ki code vaha  takk pahuch raha hai ya nahi.

        if(selectAlbum.value == "-1"){
            alert("Select an Album to import data");
            return;
        }


        //jo file  aye hai usko yaha store ker liya.
        let file = window.event.target.files[0];

         //read ki vo file
        let reader = new FileReader();

        //jab file read ho jayegi to load fire hoga and data mil jayega. 
        reader.addEventListener("load", function(){
            let data = window.event.target.result;

            //us data to json mei parse kerke store ker liya.
            let importedAlbum = JSON.parse(data);

            //isse check kiya ki browser ke console mei jake vo file ka data print ho raha hai ya
            //nahi.
            //console.log(importedAlbum);
            
            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides = album.slides.concat(importedAlbum.slides);
            //ek concat function hota hai  

            slideList.innerHTML = "";

            for(let i = 0;i < album.slides.length; i++){
                
                
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                //13-03-2022
                //initially jab koi album select hoti hai to by default uski koi bhi
                //slide open na ho main area mei jis per click karengei tabhi open ho
                //main area mei uski liye selected ko false ker diya  hai.

                album.slides[i].selected = false;
                slideList.append(slide);
            }
        });

        reader.readAsText(file);
    }

    // important feature hai add karunga apne  Committe wale project mei.
    //SlideShow Button hai basically.

    function handlePlayAlbum(){
        if(selectAlbum.value == "-1"){
            alert("Please Select an Album to Play");
            return;
        }

        playOverlay.style.display = "block";
        playOverlay.querySelector("#text").innerHTML = "Playing Album.. ";

        let album = albums.find(a => a.name == selectAlbum.value);
        let counter = album.slides.length;
        let i = 0;
        
        //jab i counter ke barabar tab play kerna band kerdo.
        //her ek slide per click trigger hoha and slide open hojayegi main area mei.
        let id = setInterval(function(){
            
            if(i < counter){
                slideList.children[i].click();
                playOverlay.querySelector("#text").innerHTML = "Showing Slide - " + (i + 1);
                i++;
            }else if(i == counter){
                clearInterval(id);
                playOverlay.style.display = "none";

                //jab sari slide showho jaye then go back to first slide.
                slideList.children[0].click();
                return;
            }

            
            // ye neeche value times ki speed hai ek tarah se.
        },1500);
    }

    function handleAddAlbum(){
        let albumName = prompt("Enter a name for the new album");
        if(albumName == null){
            return;
        }

        albumName = albumName.trim();
        if(!albumName){
            alert("Empty name not allowed");
            return;
        }

        let exists = albums.some(a => a.name == albumName);
        if(exists){
            alert(albumName + " already exists. Please use a unique new name");
            return;
        }

        let album = {
            name: albumName,
            // do albums ki photos ya slides mix hori thi uske liye selected as fasle liya hai
            selected: false,
            slides: []
        };
        
        albums.push(album);

        let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
        let newAlbumOption = document.importNode(optionTemplate, true);

        newAlbumOption.setAttribute("value", albumName);
        newAlbumOption.innerHTML = albumName;
        selectAlbum.appendChild(newAlbumOption);

        selectAlbum.value = albumName;
        selectAlbum.dispatchEvent(new Event("change"));
    }

    function handleSelectAlbum(){
        if(this.value == "-1"){
            overlay.style.display = "block";
            contentDetailsOverlay.style.display = "none";
            createSlide.style.display = "none";
            showSlide.style.display = "none";
            //jis album ko delete koya hai uska left side mei sari slides bhi dlete ho jani chahiye.
            //slide List ko clean ker dengei.
            slideList.innerHTML = "";
        } 
        else {
            overlay.style.display = "none";
            contentDetailsOverlay.style.display = "block";
            createSlide.style.display = "none";
            showSlide.style.display = "none";

            //jis time per jiski slides selected ho uski slides dihkni chahiye bas.
            let album = albums.find(a => a.name == selectAlbum.value);


            //jis album ko delete koya hai uska left side mei sari slides bhi dlete ho jani chahiye.
            //slide List ko clean ker dengei.
            slideList.innerHTML = "";


            //loop lagane se phle inner html ko empty ker diya. 
            slideList.innerHTML = "";

            for(let i = 0;i < album.slides.length; i++){
                
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                //13-03-2022
                //initially jab koi album select hoti hai to by default uski koi bhi
                //slide open na ho main area mei jis per click karengei tabhi open ho
                //main area mei uski liye selected ko false ker diya  hai.

                album.slides[i].selected = false;
                slideList.append(slide);
            }

        }


        // let selectedAlbum = selectAlbum.value;
        // let album = albums.find(a => a.name == selectAlbum.value);

        // jo album drop down mei se at the time selected hai uska selected true ker dengei.
        
        //loop lagaker bhi ker skate hai hum
        // for(let i = 0;i<albums.length;i++){
        //     if(albums[i].name == selectAlbum.value){
        //         albums[i].selected = true;
        //     }
        //     else{
        //         albums[i].selected = false;
        //     }
        // }

         
    }

    function handleNewSlideClick(){
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display = "none";

        txtSlideDesc.value = "";
        txtSlideImage.value = "";
        txtSlideTitle.value = "";


        btnSaveSlide.setAttribute("purpose", "create");
    }

    function handleSaveSlide(){

        let url = txtSlideImage.value;
        let title = txtSlideTitle.value;
        let desc = txtSlideDesc.value;

        //jab new slide add karengei.
        if(this.getAttribute("purpose") == "create"){
           

            let slideTemplate = allTemplates.content.querySelector(".slide");
            let slide = document.importNode(slideTemplate, true);

            slide.querySelector(".title").innerHTML = title;
            slide.querySelector(".desc").innerHTML = desc;
            slide.querySelector("img").setAttribute("src", url);
            slide.addEventListener("click", handleSlideClick);

            slideList.append(slide);
            //jiska naam drop mei se album ke name se match hora hai usper kaam hor hai.
            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides.push({
                title: title,
                url: url,
                desc: desc
            });

            slide.dispatchEvent(new Event("click"));

        }

        //jab edit karengei.
        else{
            //phle album select kerlo
            let album = albums.find(a => a.name == selectAlbum.value);
            let slideToUpdate = album.slides.find(s => s.selected == true);


            //jis slide ko update kerna hai uske inner html mei uska title find kiya
            //and  assign and break ker diya.
            let slideDivToUpdate;
            for(let i = 0;i<slideList.children.length;i++){
                let slideDiv = slideList.children[i];
                if(slideDiv.querySelector(".title").innerHTML == slideToUpdate.title){
                    slideDivToUpdate = slideDiv;
                    break;
                }

            }

            slideDivToUpdate.querySelector(".title").innerHTML = title;
            slideDivToUpdate.querySelector(".desc").innerHTML =  desc;
            slideDivToUpdate.querySelector("img").setAttribute("src", url);

            slideToUpdate.url = url;
            slideToUpdate.title = title;
            slideToUpdate.desc = desc;


            slideDivToUpdate.dispatchEvent(new Event("click"));

        }
}
    // us slide ke click per vo main area mei show  ho jaye.
    //aur baki sari hide rahengei.
    function handleSlideClick(){

        showSlide.style.display = "block";
        createSlide.style.display = "none";
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        
        showSlide.innerHTML = "";
        // ṣide in view jo html mei hai uska clone banaunga.

        let slideInViewTemplate = allTemplates.content.querySelector(".slide-in-view");
        let slideInView = document.importNode(slideInViewTemplate, true);

        slideInView.querySelector(".title").innerHTML = this.querySelector(".title").innerHTML;
        slideInView.querySelector(".desc").innerHTML = this.querySelector(".desc").innerHTML;
        slideInView.querySelector("img").setAttribute("src",this.querySelector("img").getAttribute("src"));
        
        // edit and delete ke liye
        slideInView.querySelector("[purpose=edit]").addEventListener("click", handleEditSlideClick);
        slideInView.querySelector("[purpose=delete]").addEventListener("click", handleDeleteSlideClick);

        showSlide.append(slideInView);

        let album = albums.find(a => a.name == selectAlbum.value);
        for(let i = 0;i<album.slides.length;i++){
            //jiska title match ho jaye uski selected true ker diya taki 
            //sirf usi ko delete and edit ker sake

            //delete and edit dono mei kaam ayega selected true .
            
            if(album.slides[i].title == this.querySelector(".title").innerHTML){
                album.slides[i].selected = true;
            }

            else{

                album.slides[i].selected = false;
            }

        }
    }

    function handleDeleteAlbum(){
        if(selectAlbum.value == "-1"){
            alert("Please Select an Album to Delete");
            return;
        }

    
        //album mei se delete kerne ke liye.
        let aidx = albums.findIndex(a => a.name == selectAlbum.value);
        albums.splice(aidx, 1);

        //select dropdown menu mei se jis album ko dlete ker rahe hai uska option bhi 
        //delete  kerna hai.
        selectAlbum.remove(selectAlbum.selectedIndex);

        selectAlbum.value = "-1";
        selectAlbum.dispatchEvent(new Event("change"));

    }

    function handleEditSlideClick(){

        //jaise hi click hoha edit button message pop up hoga.
        // alert("Danger");

        //khali create wala show hoga baki sab hide.
        showSlide.style.display = "none";
        createSlide.style.display = "block";
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";

        let album = albums.find(a => a.name == selectAlbum.value);
        let slide = album.slides.find(s => s.selected == true);
         
        //is baar 3no ki value empty nahi rakhengei.
        txtSlideDesc.value = slide.desc;
        txtSlideTitle.value = slide.title;
        txtSlideImage.value = slide.url;

        //ye jaruri hai kerna verna slide update to karega but new bana dega
        btnSaveSlide.setAttribute("purpose", "update");

    }

    function handleDeleteSlideClick(){

        //jaise hi click hoga delete button message pop up hoga.
        // alert("Danger Again");

        let album = albums.find(a => a.name == selectAlbum.value);

        //index chahiye slide index mei to index html mei se to uda diya per main album 
        //mei se bhi udana hai to index hi nikal diya.

        let sidx = album.slides.findIndex(s => s.selected == true);

        //jo delete kerni hai to be determined.
        let slideDivTBD;

        for(let i = 0;i<slideList.children.length;i++){
            let slideDiv = slideList.children[i];
            if(slideDiv.querySelector(".title").innerHTML == album.slides[sidx].title){
                slideDivTBD = slideDiv;//jab match ker jaye to assign ker de and break;
                break;
            }
        }

        //remove child naam ka function hota hai deleter kerne ke liye.
        slideList.removeChild(slideDivTBD);

        //delete to hora hai per jo delete hua hai vo main area mei abhi bhi opened show ker raha hai.
        //initial layout dikha hai jo overlay hai.

        //splice in the album array.
        album.slides.splice(sidx , 1);

        //sirf content wala part dikahega baki sare hide kerdo.
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "block";
        createSlide.style.display = "none";
        showSlide.style.display = "none";

        //main album mei se bhi permamnently udana hai current slide.
    
    }

    function saveToLocalStorage(){
        //albums directly add ni ho sakkti array hai to json mei stringy kerke daalna padega.
        let json = JSON.stringify(albums);
        localStorage.setItem("data",json);
    }

    function loadFromLocalStorage(){
        let json = localStorage.getItem("data");
        
        if(!json){
            return;
        }

        albums = JSON.parse(json);

        for(let i = 0;i<albums.length;i++){
            let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
            let newAlbumOption = document.importNode(optionTemplate, true);
    
            newAlbumOption.setAttribute("value", albums[i].name);
            newAlbumOption.innerHTML = albums[i].name;
            selectAlbum.appendChild(newAlbumOption);

        }

        selectAlbum.value  = "-1";
    }   

    loadFromLocalStorage();

})();
