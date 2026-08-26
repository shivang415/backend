const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("2 sec late kr diya");
    }, 2000); // data 2 sec baad milega isse
});

console.log("promise ban gya");

p
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.log(error);
    });

console.log("promise se pehle chal jaunga mai");