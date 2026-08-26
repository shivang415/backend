function getData() {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve("Data mil gya");
        }, 2000);

    });
}

async function main() {
    
    const data = await getData(); // await current async function ko pause karta hai, poore Node.js server ko nahi.

    console.log(data);
    console.log("bye"); // ye ruka rha
}

// getData()
//     .then((data) => {
//         console.log(data);
//     });

console.log("hello");

main();