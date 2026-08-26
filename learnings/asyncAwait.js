function getNumber() {
    return new Promise((resolve, reject) => {
        
        setTimeout(() => {
            resolve(10);
        }, 2000);
    });
}

async function main() {
    
    const num = await getNumber();

    console.log(num * 2);
}

main();