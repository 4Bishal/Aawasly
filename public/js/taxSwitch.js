let taxSwitch = document.getElementById("switchCheckDefault");
taxSwitch.addEventListener("click", () => {
    console.log("click");
    let taxInfo = document.getElementsByClassName("tax-info");
    for (info of taxInfo) {
        console.log(info.style.display)
        if (info.style.display != "inline") {
            info.style.display = "inline";
        } else {
            info.style.display = "none";
        }
    }
});