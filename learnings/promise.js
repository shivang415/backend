const myPromise = new Promise((resolve, reject) => {
    let success = false;

    if(success){
        resolve("Login Successful");
    }
    else{
        reject("login failed");
    }
});

myPromise
    .then((message) => {
        console.log(message);
        return "enjoy now";
    })
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.log(error);
    });