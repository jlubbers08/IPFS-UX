// jQuery.getScript("js/IpfsApi.js", function(data, textStatus, jqxhr) {
//     console.log(data); //data returned
//     console.log(textStatus); //success
//     console.log(jqxhr.status); //200
//     console.log('Load was performed.');
// });
var showLogs = true;
var goConfig = getConfig();
var ipfs = new IpfsApi(goConfig.host, goConfig.APIPort, {protocol: 'http'});
var FilestoUpdate = []
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
// var iDB = indexedDB.open("IPFSManager", 9);
// indexedDB.open("IPFSManager", 9);

function checkConnection(){

    showLoader("Verifying Connection");
    try{

        ipfs.id(function (err, resp) {
            if (err) {
                LoadPage("config");
                hideLoader();
            }
            if(resp !== undefined){
               LoadPage("FileUploader/index");
                hideLoader();
            }
        });
    }
    catch (e) {
        LoadPage("config");
        hideLoader();
    }


}
var intDisplay = 0,
    loadOpac = 0;
var currentConfig;
function buildConfigEditor(){
    ipfs.config.get(function(err,resp){
        if(err){
            throw new Error(err)
        }
        var configObj = JSON.parse(String.fromCharCode.apply(null,resp));
        currentConfig = configObj;
        console.log(configObj);
        loopJSObject(configObj);

    })
}

function loopJSObject(loObject){
    var i;
    for (var key in loObject) {
        if (loObject.hasOwnProperty(key)) {
            console.log(key + " -> " + loObject[key]);
            if(typeof (loObject[key]) === "object"){
                loopJSObject(loObject[key]);
            }
        }
    }
}
function showLoader(pcMessage = "", msAutoHide = 7000){
    setTimeout(hideLoader,msAutoHide);
    var page = document.getElementById("displayBodyt");
    // var loader = document.createElement("div");
    // loader.id = "waitLoader";
    // var spinnerMessageBox = document.createElement("div");
    // spinnerMessageBox.style.top =  (page.clientHeight/2 - 60) + "px";
    // spinnerMessageBox.style.left =  (page.clientWidth/2 - 60) + "px";
    // spinnerMessageBox.style.position = "absolute";
    // var spinner = document.createElement("div");
    // spinner.id = "loaderSpinner";
    //
    // spinner.className = "loader";
    // spinnerMessageBox.appendChild(spinner);
    // var message = document.createElement("h3");
    // message.id = "loaderMessage";
    // message.innerHTML = pcMessage;
    // spinnerMessageBox.appendChild(message);
    // loader.appendChild(spinnerMessageBox)
    // page.appendChild(loader)
    clearInterval(intDisplay);
    intDisplay = setInterval(function(){
        var loader = document.getElementById("cover");

        if(loader.style.opacity == 1){
            clearTimeout(intDisplay);
            return;
        }
        loader.style.opacity = loadOpac = loadOpac + .01;
    },5);

    var loader = document.getElementById("cover");
    loader.style.display = "block"
    var spinner = document.getElementById("spinner")
    spinner.style.top =  ((page.clientHeight/2) - 60) + "px";
    spinner.style.left =  ((page.clientWidth/2) - 60) + "px";
    spinner.style.position = "absolute";
    var messageBox = document.getElementById("messageBox");
    messageBox.style.top =  ((page.clientHeight/2) + 60) + "px";
    // message.style.left =  ((page.clientWidth/2) - 60) + "px";
    var message = document.getElementById("loadingMessage");
    if(pcMessage != ""){
        message.innerText = pcMessage;
        message.style.display = "block"
        var messageWidth = message.clientWidth;
        message.style.left = ((page.clientWidth/2)- (messageWidth/2) ) + "px";
    }
    else
    {
        message.style.display = "none";
    }




}
function hideLoader(){

    clearInterval(intDisplay);
    intDisplay = setInterval(function(){
        var loader = document.getElementById("cover");

        if(loader.style.opacity < 0){
            loader.style.opacity = loadOpac = 0
            var message = document.getElementById("loadingMessage");
            clearTimeout(intDisplay);
            message.innerText = "";
            loader.style.display = "none";

            return;
        }
        loader.style.opacity = loadOpac = loadOpac  - .01;
    },5);




}


function addtoIDB(pcExecuteFunction){
    indexedDB.open("IPFSManager", 9, pcExecuteFunction);
}
function setupDataBase(){


    var request =  indexedDB.open("IPFSManager", 9, function(e){console.log("TestFunction");});
    // var request = iDB;



    request.onerror = function() {
        console.log(request);
        alert("Indexed Databases are not support!\r\nChances are this app won't function properly if at all.");
    };
    request.onsuccess = function() {
        console.log("Success");
        // console.log(request);
        if(!request.result.objectStoreNames.contains("Logs")){
            // request.onupgradeneeded();
        }
        request.result.close();
    };
    request.onupgradeneeded   = function event(e){
        console.log("Attempting to Add Key Stores");
        // console.log(e);
        var ldb = request.result;
        if (!ldb.objectStoreNames.contains("Logs")){
            var LogsStore = ldb.createObjectStore("Logs",{ keyPath: "id", autoIncrement:true });
        }
        else{
            var LogsStore = e.currentTarget.transaction.objectStore("Logs");
            // var tx = ldb.transaction("Logs", "readwrite");
            // var LogsStore = tx.objectStore("Logs");
        }
        // var index = LogsStore.createIndex("NameIndex", ["Message", "CodeLocation","DateAdded"]);
        if(!LogsStore.indexNames.contains("id")){
            LogsStore.createIndex("id", "id", {unique:true});
        }
        if(!LogsStore.indexNames.contains("Message")){
            LogsStore.createIndex("Message","Message",{unique:false});
        }
        if(!LogsStore.indexNames.contains("CodeLocation")){
            LogsStore.createIndex("CodeLocation","CodeLocation",{unique:false});
        }
        if(!LogsStore.indexNames.contains("DateAdded")){
            LogsStore.createIndex("DateAdded","DateAdded",{unique:false});
        }
        if(!LogsStore.indexNames.contains("CodeLine")){
            LogsStore.createIndex("CodeLine", "CodeLine", {unique:false});
        }
        //
        // LogsStore.createIndex("id", "id", {unique:true});
        // LogsStore.createIndex("Message","Message",{unique:false});
        // LogsStore.createIndex("CodeLocation","CodeLocation",{unique:false});
        // LogsStore.createIndex("DateAdded","DateAdded",{unique:false});
        // LogsStore.createIndex("CodeLine", "CodeLine", {unique:false});


        if (!ldb.objectStoreNames.contains("Files")){
            var FilesStore = ldb.createObjectStore("Files",{ keyPath: "id", autoIncrement:true });
        }
        else{
            // var tx = db.transaction("Files", "readwrite");
            var FilesStore = e.currentTarget.transaction.objectStore("Files")
        }
        if(!FilesStore.indexNames.contains("FileName")){
            FilesStore.createIndex("FileName","FileName",{unique:false});
        }
        if(!FilesStore.indexNames.contains("Hash")){
            FilesStore.createIndex("Hash","Hash",{unique:false});
        }
        if(!FilesStore.indexNames.contains("Host")){
            FilesStore.createIndex("Host","Host",{unique:false});
        }
        if(!FilesStore.indexNames.contains("DateAdded")){
            FilesStore.createIndex("DateAdded","DateAdded",{unique:false});
        }
        if(!FilesStore.indexNames.contains("FolderHash")){
                    FilesStore.createIndex("FolderHash","FolderHash",{unique:false});
                }
        if(!FilesStore.indexNames.contains("Path")){
                    FilesStore.createIndex("Path","Path",{unique:false});
                }

        // var FilesStore = ldb.createObjectStore("Files", { keyPath: "id", autoIncrement:true });
        // FilesStore.createIndex("FileName","FileName",{unique:false});
        // FilesStore.createIndex("Hash","Hash",{unique:false});
        // FilesStore.createIndex("Host","Host",{unique:false});
        // FilesStore.createIndex("DateAdded","DateAdded",{unique:false});
        console.log("DbClosed");
        console.log(request);


    };

}

function Log(message, codeLoaction = "Unknown"){

    var currentDate = new Date().toLocaleString();
    // var iDB = IndexedDB.open()
    // var request = iDB;

    if(typeof(Error.captureStackTrace) == "function"){
        var obj = {};
        Error.captureStackTrace(obj, Log);

        var lcStack = obj.stack.toString();
        var lnStart = lcStack.indexOf(">:") + 2;



        var LineNumber = lcStack.substr(lnStart,lcStack.indexOf(":", lnStart)- lnStart);
        // console.log(LineNumber);
        LineNumber = parseInt(LineNumber);
        console.log(LineNumber);
    }
    else{
        var LineNumber = "??"
    }

    var request = indexedDB.open("IPFSManager", 9, function(e){});

    request.onsuccess = function(e){

        // console.log("Success in Logging");
        var db = request.result;
        var tx = db.transaction("Logs", "readwrite");
        var store = tx.objectStore("Logs");
        // console.log("Objects Made");

        // var index = store.index("NameIndex");
        store.add({

            Message:message,
            DateAdded:currentDate,
            CodeLocation:codeLoaction,
            CodeLine:LineNumber
        });
        // console.log("PutComplete");

        tx.oncomplete = function() {
            // console.log("Db Close LOGGING ADDED");
            db.close();
            // console.log("Db Close LOGGING ADDED");
        };

    };
    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
    };



    if(showLogs){

        console.log(message );
    }
}
function wait(ms)
{
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
    console.log("waitComplete")
}
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i];
};
var gbFirstLoad = true;
function LoadPage(pcCurrentPage){
    var url = document.location.href, idx = url.indexOf("#")
    var hash = idx != -1 ? url.substring(idx+1) : "";
    var ele = document.getElementById("navBarToggle")
    var page = document.getElementById("displayBodyt");
    if(!ele.className.includes("collapsed") && !gbFirstLoad && page.clientWidth < 768){
        ele.click();
    }
    if(hash == pcCurrentPage){
        return;
    }
    if(hash == ''){
        hash = pcCurrentPage;
    }
    // Log("Loading Page: " + hash);
    $('#MainContainer').load('./' + hash + ".html");
    var newURL;
    if(url.indexOf("#") != -1){
        newURL = url.substring(0, url.indexOf("#")) + "#" + pcCurrentPage;
    }
    else{
        newURL = url + "#" + pcCurrentPage;
    }
    gbFirstLoad = false;
    // Log(newURL);
    // window.location.href = url.substring(url.indexOf("#"))
}
function LoadRepoInfo(){
    Log("Sending Request:", arguments.callee.name)
    ipfs.repo.stat(function (err, res){
        if (err) {
            throw err
        }

        Log(JSON.stringify(res), "LoadRepoInfo");
        document.getElementById("numObjects").innerHTML = "Number of Objects: " + res.numObjects;
        document.getElementById("repoSize").innerHTML = "Repo Size: " + bytesToSize(res.repoSize);
        document.getElementById("storageMax").innerHTML = "Max Storage: " + bytesToSize(res.storageMax);
        document.getElementById("repoPath").innerHTML = "Repo Path: " + res.repoPath;

        var ele = document.getElementById('StatusMessage');
        ele.style.display = "none";
    });
    ipfs.repo.version(function (err, res){
        if (err) {
            throw err
        }

        Log(res, "LoadRepoInfo");
        document.getElementById("repoVersion").innerHTML = "Repo Version: " + res;

    });
}
function setupPeersPage(){
    ipfs.swarm.peers(function (err, resp) {
        if (err) {
            throw err
        }
        document.getElementById("CurrentPeers").innerHTML = resp.length + " Connected Peers";
        var addrList = document.getElementById("PeersList");
        resp.forEach(function(peer){
                // Log(addr);
                var ele = document.createElement("li");
                ele.className ="list-group-item d-flex justify-content-between align-items-center";
                ele.innerText = peer.addr + "/" + peer.peer._idB58String;
                // Log(ele);

                addrList.appendChild(ele);
            }
        )

    });
}

function setupConfig(){
    var loStartConfig = localStorage.getItem("ipfsManagerConfig");
    var config = loStartConfig;
    if(config === null){
        config = {
            host:"localhost",
            APIPort:5001
        }

    }
    else{
        config = JSON.parse(config);
    }
    if(config['Gateway'] === undefined) {
        config["Gateway"] = "https://gateway.ipfs.io/ipfs/";
    }
    if(loStartConfig !== config){
        saveConfigToStorage(config);
    }

}
function showResponse (err, resp){
    var ele = document.getElementById("responseArea");
    if (err) {
        console.log(err)
        var stack = new Error().stack;
        // Log("Test Failed: " + err.toString(), "testConfig");
        document.getElementById("responseArea").innerHTML = err.toString();
        // throw err
    }
    if(resp !== undefined){
        document.getElementById("responseArea").innerHTML = JSON.stringify(resp,undefined,2);
        // Log("Test Successful!", "testConfig")
    }
    var rect = ele.getBoundingClientRect();
    var top = rect.top;
    ele.style.maxHeight = (window.innerHeight - top - 50) + "px";

    // ele.innerHTML = JSON.stringify(resp, undefined, 2);


}
function runCommand(){
    var cmd = document.getElementById('commandInput').value;
    cmd = cmd.toLowerCase().trim();
    Log("Running Command: " + cmd, arguments.callee.name);
    cmd = cmd.replace("(", "");
    cmd = cmd.replace(";", "");
    cmd = cmd.replace(")", "");
    document.getElementById('commandInput').value = cmd + "();";
    cmd = cmd + "(showResponse)";



    //(showResponse)
    var f = new Function(cmd);
    f();

}
function SetupNodeStatus(){
    // var ipfs = new IpfsApi();
    ipfs.id(function (err, identity) {
        if (err) {
            throw err
        }
        document.getElementById("NodeId").innerHTML = "Node Id: " + identity.id;
        document.getElementById("agentVersion").innerHTML = "Agent Version: " + identity.agentVersion;
        document.getElementById("protocolVersion").innerHTML = "Protocol Version: " + identity.protocolVersion;
        var addrList = document.getElementById("NodeAddresses");
        identity.addresses.forEach(function(addr){
            // Log(addr);
            var ele = document.createElement("li");
            ele.className ="list-group-item d-flex justify-content-between align-items-center";
            ele.innerText = addr;
            // Log(ele);

            addrList.appendChild(ele);
            }
        )

    });
    ipfs.version(function (err, identity) {
        if (err) {
            throw err
        }
        Log(JSON.stringify(identity), "SetupNodeStatus");
        document.getElementById("ipfsVersion").innerHTML = "IPFS Version: " + identity.version;
        document.getElementById("commit").innerHTML = "Commit: " + identity.commit;
        document.getElementById("repoVersion").innerHTML = "Repo Version: " + identity.repo;
        document.getElementById("goLanguage").innerHTML = "Go Version : " + identity.GoLang;
        document.getElementById("System").innerHTML = "System : " + identity.system;

    });

}
function loadConfigPage() {
    var config = getConfig();
    document.getElementById("hostName").value = config.host;
    document.getElementById("APIPort").value = config.APIPort;
    document.getElementById("Gateway").value = config.Gateway;

}
function getConfig(){
    var config = JSON.parse(localStorage.getItem("ipfsManagerConfig"));
    if(config === null){
        config = {};
    }
    return config;
}
function testConfig(){

    var host = document.getElementById("hostName").value;
    var APIPort = document.getElementById("APIPort").value;
    Log("Testing Config: " + host + " : " + APIPort);
    showLoader("Testing Config ...");
    var loIPFS = new IpfsApi(host, APIPort, {protocol: 'http'});
    try{

        loIPFS.id(function (err, resp) {
            hideLoader();
            if (err) {
                console.log(err)
                var stack = new Error().stack;
                Log("Test Failed: " + err.toString(), "testConfig");
                document.getElementById("responseArea").innerHTML = err.toString();
                // throw err
            }
            if(resp !== undefined){
                document.getElementById("responseArea").innerHTML = JSON.stringify(resp,undefined,2);
                Log("Test Successful!", "testConfig")
            }


        });
    }
    catch (e) {
        Log("Test Failed: " + e.message, "testConfig");
        hideLoader();
       // console.log(e);
      //  document.getElementById("responseArea").innerHTML = e.toString();
    }


    loIPFS = null;

}
function saveConfigToStorage(poConfig){
    // Log("Saving Config", arguments.callee.name);
    // Log(JSON.stringify(poConfig), arguments.callee.name);
    localStorage.setItem("ipfsManagerConfig", JSON.stringify(poConfig));
}


function pageSaveConfig(){
    var config = getConfig();
    if (config == undefined){
        config == {};
    }
    config.host = document.getElementById("hostName").value;
    config.APIPort = document.getElementById("APIPort").value;
    config.Gateway = document.getElementById("Gateway").value;
    saveConfigToStorage(config);
}

var recsToUpdate = [];

function updateFileRecords() {
    var recIds = [];
    var i;
    for (i = 0; i < recsToUpdate.length; i++) {
        recIds.push(recsToUpdate[i].id);
    }

    var request = indexedDB.open("IPFSManager", 9, function (e) {
    });

    request.onsuccess = function (e) {

        console.log("Updating Files Called");
        var db = request.result;
        var tx = db.transaction("Files", "readwrite");
        var store = tx.objectStore("Files");
        var store = tx.objectStore("Files");
        var index = store.index("FolderHash");
        var Cursor = index.openCursor();
        Cursor.onsuccess =  function (event) {

            var loCursor = event.target.result;
            if (loCursor) {
                var file = loCursor.value;
                if(recIds.includes(file.id)){
                    var loUpdateFile;
                    var lnIndex = recsToUpdate.map(function(item){return item.id}).indexOf(file.id);
                    loUpdateFile = recsToUpdate[lnIndex];
                    file.FolderHash = loUpdateFile.AddToPath;
                    file.Path = loUpdateFile.AddToPath + "/" + loUpdateFile.FileName;
                    loCursor.update(file);
                    recsToUpdate.splice(lnIndex,1)
                    var lnRecIdIndex = recIds.map(function(item){return item}).indexOf(file.id);
                    recIds.splice(lnRecIdIndex,1);

                }

                loCursor.continue();
            }
            else{

            }

        }

    };
    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
    };
}
function addFile(){
    // console.log("AddFileCalled")
    if(FilestoUpdate[0] !== undefined){
        var lcAddPath = FilestoUpdate[0].AddToPath;
        var lcFileName = FilestoUpdate[0].FileName
        var lcFileHash = FilestoUpdate[0].Hash
        ipfs.object.patch.addLink(lcAddPath, {
                name: lcFileName,
                multihash: lcFileHash
            }
            , (err, newNode) => {
                if (err) {
                    throw err
                }
                console.log("New MultiHash: " + newNode._json.multihash);
                // lcFinalHash = newNode._json.multihash;
                // waiting = false;
                var i;
                var finalHash = newNode._json.multihash;
                FilestoUpdate.shift();
                for(i=0; i< FilestoUpdate.length; i++){
                    if(FilestoUpdate[i].AddToPath == lcAddPath){
                        FilestoUpdate[i].AddToPath = finalHash;
                    }
                }
                for(i=0; i< recsToUpdate.length; i++){
                    if(recsToUpdate[i].AddToPath == lcAddPath){
                        recsToUpdate[i].AddToPath = finalHash;
                    }
                }
                addFile();

            }
        )
    }
    else{
        updateFileRecords();
    }




}

function updateIPFSFolderHashes(pcHash, pcFileNameIncluded, pcFileHash){
    var request = indexedDB.open("IPFSManager", 9, function(e){});

    request.onsuccess = function(e) {

        console.log("Updating Files Called");
        var db = request.result;
        var tx = db.transaction("Files", "readwrite");



        var store = tx.objectStore("Files");
        var index = store.index("FolderHash");
        var lcFinalHash = pcHash;

        var loCursor = index.openCursor(pcHash);

        loCursor.onsuccess =  function (event) {



            var cursor = event.target.result;
            // console.log(cursor);
            if (cursor) {
                var file = cursor.value;
                // if(file.FolderHash == pcHash && file.FileName == pcFileNameIncluded)
                // console.log(file);
                if (file.FolderHash == pcHash && file.FileName != pcFileNameIncluded || file.Hash === pcFileHash) {
                    var loFile = file;
                    loFile["AddToPath"] = pcHash;
                    FilestoUpdate.push(loFile);
                    recsToUpdate.push(loFile);

                }

                cursor.continue();


            }
            else {
                console.log('Entries all displayed.');
               addFile();
            }

        };



    };
    request.oncomplete = function(e){
        // console.log("On Complete Called");
        // addFile();
    };


    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
    };
}
function addFileToDb(response, pcFile){
    var currentDate = new Date().toLocaleString();
    var config = getConfig();
    Log("Adding File: " + pcFile.name , arguments.callee.name);
    var lcFileName = pcFile.name.replace(/ /g, "");
    var i;
    for(i=0; i< response.length; i++){
        lcFolderHash = response[i].hash;
    }

    var request = indexedDB.open("IPFSManager", 9, function(e){});

    request.onsuccess = function(e){

        // console.log("Success in Adding Files");
        var db = request.result;
        var tx = db.transaction("Files", "readwrite");
        var store = tx.objectStore("Files");
        // console.log("File Made");

        // var index = store.index("NameIndex");
        store.add({

            FileName:lcFileName,
            DateAdded:currentDate,
            Host:config.host,
            Hash:response[0].hash,
            FolderHash:lcFolderHash,
            Path: lcFolderHash + "/" + lcFileName
        });
        // console.log("PutComplete");

        tx.oncomplete = function() {
            // console.log("Db Close Files ADDED");
            db.close();
            // console.log("Db Close Files ADDED and Closed");
        };

        var table = document.getElementById("filesTable");
        var htmlRow = document.createElement("tr");

        var cell = document.createElement("td")
        cell.className = "check";
        cell.innerHTML = "<input class='tzCheckBox' data-off=\"OFF\" name='ch_emails' data-on='ON' type='checkbox'>";
        htmlRow.appendChild(cell);


        var cell = document.createElement("td")
        cell.className = "share";
        var shareButton = document.createElement("button")
        shareButton.className = "btn btn-primary";
        shareButton.innerHTML = "<i class=\"material-icons\">share</i> Share";
        // shareButton.onclick  = SendMail('" + pcFile.name + "','"+ path +"');
        cell.appendChild(shareButton)
        htmlRow.appendChild(cell);


        var cell = document.createElement("td")
        cell.className = "date";
        cell.innerHTML = currentDate;
        htmlRow.appendChild(cell);

        var cell = document.createElement("td")
        cell.innerHTML = lcFileName;
        cell.className = "fileName";
        htmlRow.appendChild(cell);

        var cell = document.createElement("td")
        cell.className = "link";
        var link = document.createElement("a");
        var path = lcFolderHash + "/" + lcFileName;
        if (path === undefined){
            path = cursor.value.Hash;
        }

        link.href = config.Gateway + path;
        link.target = "_blank";
        link.innerHTML = path;
        // console.log(link);
        cell.appendChild(link);
        htmlRow.appendChild(cell);

        table.insertBefore(htmlRow, table.firstChild);

    };
    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
    };






}


function setupFiles(){
    var config = getConfig();

    var request = indexedDB.open("IPFSManager", 9, function(e){});
    showLoader("Getting Files");
    request.onsuccess = function(e) {

        console.log("Success in Adding Files");
        var db = request.result;
        var tx = db.transaction("Files", "readonly");
        var store = tx.objectStore("Files");
        var index = store.index("DateAdded");
        index.openCursor().onsuccess = function (event) {

            var table = document.getElementById("filesTable");

            var cursor = event.target.result;
            if (cursor) {
                if(cursor.value.Host == config.host) {
                    if(!knownFolderHashes.includes(cursor.value.FolderHash)){
                        knownFolderHashes.push(cursor.value.FolderHash);
                    }
                    var path = cursor.value.Path;
                    if (path === undefined){
                        path = cursor.value.Hash;
                    }
                    //console.log(cursor.value);
                    var htmlRow = document.createElement("tr");
                    htmlRow.className = "col-sm-12";

                    var cell = document.createElement("td")
                    cell.className = "check";

                    cell.innerHTML = "<input class='tzCheckBox' data-off=\"OFF\" name='ch_emails' data-on='ON' type='checkbox'>";
                    htmlRow.appendChild(cell);



                    var cell = document.createElement("td")
                    cell.className = "share";
                    var shareButton = document.createElement("button")
                    shareButton.className = "btn btn-primary";
                    shareButton.setAttribute("onclick", "SendMail('" +cursor.value.FileName +"','" + path + "');" );
                    // SendMail(cursor.value.FileName,cursor.value.path);
                    shareButton.innerHTML = "<i class=\"material-icons\">share</i> Share"
                    cell.appendChild(shareButton)
                    htmlRow.appendChild(cell);

                    var cell = document.createElement("td")
                    cell.className = "date";
                    cell.innerHTML = cursor.value.DateAdded;
                    htmlRow.appendChild(cell);

                    var cell = document.createElement("td")
                    cell.className = "fileName";
                    cell.innerHTML = cursor.value.FileName;
                    htmlRow.appendChild(cell);

                    var cell = document.createElement("td")
                    cell.className = "link";
                    var link = document.createElement("a");

                    link.href = config.Gateway + path;
                    link.target = "_blank";
                    link.innerHTML = path;
                    // console.log(link);
                    cell.appendChild(link);
                    htmlRow.appendChild(cell);
                    table.insertBefore(htmlRow, table.firstChild);

                }
                cursor.continue();
            }
            else {
                console.log('Entries all displayed.');
            }
            hideLoader();
            // console.log(results.rows[i]);

        };


        tx.oncomplete = function() {

            db.close();

        };
    };


    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
        hideLoader();
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
        hideLoader();
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
        hideLoader();
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
        hideLoader();
    };



    }


function getLogs(){

    showLoader("Getting Logs");
    var request = indexedDB.open("IPFSManager", 9, function(e){});

    request.onsuccess = function(e) {

        // console.log("Success in Adding Files");
        var db = request.result;
        var tx = db.transaction("Logs", "readonly");
        var store = tx.objectStore("Logs");
        var index = store.index("DateAdded");
        index.openCursor().onsuccess = function (event) {
            var table = document.getElementById("LogsTable");

            var cursor = event.target.result;
            // console.log("Cursor Open.")
            if (cursor) {
                var log = cursor.value;

                var htmlRow = document.createElement("tr");
                var cell = document.createElement("td")
                cell.innerHTML = log.DateAdded;
                htmlRow.appendChild(cell);

                var cell = document.createElement("td")
                cell.innerHTML = log.Message;
                htmlRow.appendChild(cell);

                var cell = document.createElement("td")
                cell.innerHTML = log.CodeLocation;
                htmlRow.appendChild(cell);
                var cell = document.createElement("td")
                cell.innerHTML = log.CodeLine;
                htmlRow.appendChild(cell);

                    table.insertBefore(htmlRow, table.firstChild);
                    cursor.continue();

            }
            else {
                console.log('Entries all displayed.');
            }
            // console.log(results.rows[i]);
            hideLoader();

        };


        tx.oncomplete = function() {

            db.close();

        };
    };


    request.onabort = function(e){
        console.log("aborted");
        console.log(e);
        hideLoader();
    };
    request.onclose = function(e){
        console.log("Closing");
        console.log(e);
        hideLoader();
    };


    request.onerror = function(e){
        console.log("Error");
        console.log(e);
        hideLoader();
    };
    request.onblocked = function(e){
        console.log("Blocked");
        console.log(e);
        hideLoader();
    };

}

function deleteLogs(){
    var request = indexedDB.open("IPFSManager", 9, function(e){});

    request.onsuccess = function(e) {

        // console.log("Success in Adding Files");
        var db = request.result;
        clearData(db)
    };
    function clearData(db) {
        // open a read/write db transaction, ready for clearing the data
        var transaction = db.transaction(["Logs"], "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function (event) {
            Log("Logs Cleared.", "deleteLogs");

            var table = document.getElementById("LogsTable");
            table.innerHTML = "";
            getLogs();
        };


        // create an object store on the transaction
        var objectStore = transaction.objectStore("Logs");

        // Make a request to clear all the data out of the object store
       objectStore.clear();


    }
}

function deleteFiles() {
    var request = indexedDB.open("IPFSManager", 9, function (e) {
    });
    var config = getConfig();
    request.onsuccess = function (e) {


        var db = request.result;
        var tx = db.transaction("Files", "readonly");
        var store = tx.objectStore("Files");
        var index = store.index("DateAdded");
        index.openCursor().onsuccess = function (event) {

            var table = document.getElementById("filesTable");

            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.Host == config.host) {
                    // ipfs.files.rm("/ipfs/" + cursor.value.Path, (err) => {
                    //     Log("Removing File From Repo: " + "/" +cursor.value.Path);
                    //     if (err) {
                    //         console.error(err)
                    //     }
                    //
                    // })
                }


                cursor.continue();
            }
            else {
                console.log('Entries all displayed.');
            }

            clearData(db)
        };

        function clearData(db) {
            // open a read/write db transaction, ready for clearing the data
            var transaction = db.transaction(["Files"], "readwrite");

            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function (event) {
                Log("Files Cleared.", "deleteLogs");

                var table = document.getElementById("filesTable");
                table.innerHTML = "";
                setupFiles();
            };


            // create an object store on the transaction
            var objectStore = transaction.objectStore("Files");

            // Make a request to clear all the data out of the object store
            objectStore.clear();


        }
    }
}

function SendMail(pcFileName, pcLink) {
        var gateway = "https://gateway.ipfs.ip/ipfs/"

        var email = 'sample@gmail.com';
        var subject = 'IPFS Links';
        var newLine = escape("\r\n");
        var emailBody =  "Hey! " + "I've got some links you should check out!" + newLine +newLine +
            pcFileName + "  -  " + escape(gateway+pcLink) + newLine + newLine + "https://ipfs.jefflubbers.com/";


        console.log(emailBody);
        var attach = '?attach=';
        attach = "";
        document.location = "mailto:jlubbers@test.com?subject="+subject+"&body="+emailBody+ attach;
    }
