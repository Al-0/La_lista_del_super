const add = document.getElementById('add');
const inputProduct = document.getElementById('input-product');
const inputPrice = document.getElementById('input-price');
const products = document.getElementById('products');
const superTotal = document.getElementById('total');
const search = document.getElementById('search');
const logout = document.getElementById('logout');
const auth = firebase.auth();
let uid = '';

logout.addEventListener('click',() =>{
    auth.signOut();
    window.location.href = "index.html";
})

firebase.auth().onAuthStateChanged(firebaseUser =>{
    if (firebaseUser)
    {
        uid = firebaseUser.uid;
        firebase.database().ref('users/' + uid).once('value').then(
            function(snapshot){
                if (snapshot.val() != null)
                {
                    productsArray = JSON.parse(snapshot.val().products_Array);
                    superTotal.innerHTML = snapshot.val().Total;
                    writerows();
                    interactivity();
                }
                else
                {
                    superTotal.innerHTML = "$ 0";   
                }
            }
        )
    }
})

const ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};
// ==================local=================
//let productsArray = JSON.parse(localStorage.getItem("ProductsArray")) || [];


let productsArray = [];
 

// window.addEventListener('load',() =>{
//     //================== local=============================
//     //superTotal.innerHTML = localStorage.getItem("Total") || "$ 0";
//     // firebase.database().ref('Data').once('value').then(
//     //     function(snapshot){
//     //         if (snapshot.val() != null)
//     //         {
//     //             productsArray = JSON.parse(snapshot.val().products_Array);
//     //             superTotal.innerHTML = snapshot.val().Total;
//     //             writerows();
//     //             interactivity();
//     //         }
//     //         else
//     //         {
//     //             superTotal.innerHTML = "$ 0";   
//     //         }
//     //     }
//     // )
//     console.log(firebase.auth().currentUser);
// })


add.addEventListener('click',() =>{
    //console.log(`product: ${inputProduct.value}`);
    //console.log(`price: ${inputPrice.value}`);
    const product = inputProduct.value;
    const price = inputPrice.value;

    // Verification
    if (product.length == 0 || price.length == 0)
    {
        swal("Error de registro", "Por favor llene ambos campos", "error")
        return;
    }

    if (isNaN(Number(price)))
    {
        swal("Error de registro", "Por favor introduzca un precio numérico", "error")
        return;
    }

    // Reset inputs
    inputProduct.value = "";
    inputPrice.value = "";
    inputProduct.focus();

    // Add to the array
    productsArray.push({
        product: product,
        price: price,
        id: ID(),
        check: false,
    },);

    // Update the total
    let suma = Number(superTotal.innerHTML.slice(2,superTotal.innerHTML .length));
    suma += Number(price);
    superTotal.innerHTML = `$ ${suma}`;

    // Update the html && cloud
    savetoCloud(productsArray, superTotal.innerHTML);
    writerows();
    interactivity();
})

/*
const savetoLocalStorage = (e) =>{
    localStorage.setItem("ProductsArray",JSON.stringify(e));
}

const totaltoLocalStorage = (e) =>{
    localStorage.setItem("Total", e);
}
*/

const savetoCloud = (e, t) =>{
    firebase.database().ref('users/' + uid).set(
        {
            products_Array: JSON.stringify(e),
            Total: t
        }
    );
}

search.addEventListener('input', () =>{
    writerows();
    interactivity();
})

const writerows = () => {
    products.innerHTML = ``;
    productsArray.forEach(e => {
        if (e.product.toLowerCase().search(search.value.toLowerCase()) != -1)
        {
            products.innerHTML += `
            <div class = "rows" id="${e.id}">
                <div>
                    <input id ="check" type="checkbox">
                </div>
                <p id="product-name">${e.product}</p>
                <p id="product-price">${e.price}</p>
                <div class="icons">
                    <i id = "pen" class="fas fa-pen"></i>
                    <i id = "trash" class="fas fa-trash"></i>
                </div>
            </div>
            `;  
        }
    });
}

const interactivity = () =>{
    // Check highlighting
    let rows = document.querySelectorAll('.rows #check')
    rows.forEach(e =>{
        let parent_id = e.parentElement.parentElement.getAttribute('id');
        productsArray.forEach((x, index) =>{
            if (x.id == parent_id)
            {
                if (x.check == true)
                {
                    e.parentNode.parentElement.style.backgroundColor = "CornflowerBlue";
                    e.parentNode.parentElement.style.textDecoration = "underline";
                    e.parentNode.parentElement.style.color = "white";
                    e.parentNode.parentElement.style.fontWeight = "bold";
                    e.parentNode.parentElement.style.borderRadius = "40%";
                }
                else
                {
                    e.parentNode.parentElement.style.backgroundColor = "transparent";
                    e.parentNode.parentElement.style.textDecoration = "none";
                    e.parentNode.parentElement.style.color = "black";
                    e.parentNode.parentElement.style.fontWeight = "normal";
                }
            }
        })
        e.addEventListener('change',function(){
            if (e.parentNode.parentElement.style.textDecoration == "none")
            {
                e.parentNode.parentElement.style.backgroundColor = "CornflowerBlue";
                e.parentNode.parentElement.style.textDecoration = "underline";
                e.parentNode.parentElement.style.color = "white";
                e.parentNode.parentElement.style.fontWeight = "bold";
                e.parentNode.parentElement.style.borderRadius = "40%";
                productsArray.forEach((x, index) =>{
                    if (x.id == parent_id)
                    {
                        x.check = true;
                        savetoCloud(productsArray, superTotal.innerHTML);
                    }
                })
            }
            else
            {
                e.parentNode.parentElement.style.backgroundColor = "transparent";
                e.parentNode.parentElement.style.textDecoration = "none";
                e.parentNode.parentElement.style.color = "black";
                e.parentNode.parentElement.style.fontWeight = "normal";
                productsArray.forEach((x, index) =>{
                    if (x.id == parent_id)
                    {
                        x.check = false;
                        savetoCloud(productsArray, superTotal.innerHTML);
                    }
                })
            }
            e.checked = false;
        })
    })

    // Update
    rows = document.querySelectorAll('.rows .icons #pen')
    rows.forEach(e =>{
        e.addEventListener('click',function(){
            let edit_name = e.parentElement.parentElement.querySelector('#product-name');
            let edit_price = e.parentElement.parentElement.querySelector('#product-price');
            let parent_id = e.parentElement.parentElement.getAttribute('id');
            swal('Por favor introduzca el nuevo nombre', {
                content: {
                    element: "input",
                    attributes: {
                        type: "text",
                        value: edit_name.innerHTML,
                    },
                },
                buttons: {
                    cancel: true,
                    confirm: {
                        text: "Actualizar",
                    },
                },
            })
            .then((val) => {
                //
                if (typeof val == 'string')
                {
                    let new_name = val;
                    if (new_name.length == 0) new_name = edit_name.innerHTML;
                    swal('Por favor introduzca el nuevo precio', {
                        content: {
                            element: "input",
                            attributes: {
                                type: "text",
                                value: edit_price.innerHTML,
                            },
                        },
                        buttons: {
                            cancel: true,
                            confirm: {
                                text: "Actualizar",
                            },
                        },
                    })
                    .then((value) => {
                        //
                        if (typeof value != 'object'){
                            let new_price = value;
                            if (new_price.length == 0) new_price = edit_price.innerHTML;
                            if (isNaN(Number(new_price)))
                            {
                                swal("Error de registro", "Por favor introduzca un precio numérico", "error")
                            }
                            else
                            {
                                productsArray.forEach((x, index) =>{
                                    if (x.id == parent_id)
                                    {
                                        // Actualizar suma
                                        suma = Number(superTotal.innerHTML.slice(2,superTotal.innerHTML .length));
                                        suma -= Number(x.price);
                                        suma += Number(new_price);
                                        superTotal.innerHTML = `$ ${suma}`;
                                        // Actualizar elemento
                                        x.price = new_price;
                                        x.product = new_name;
                                    }
                                })
                                savetoCloud(productsArray, superTotal.innerHTML);
                                edit_name.innerHTML = new_name;
                                edit_price.innerHTML = new_price;
                                swal("El registro ha sido actualizado exitosamente.", {
                                    icon: "success",
                                });
                            }
                        }
                    });
                }
            });

            // Con Sweet Alert 2 podemos tener 2 campos de input mediante trucos 'https://sweetalert2.github.io/#input-types'
            //
            // (async () => {

            //     const { value: formValues } = await Swal.fire({
            //       title: 'Multiple inputs',
            //       html:
            //         '<label for="swal-input1">Nuevo nombre</label><input id="swal-input1" class="swal2-input">' +
            //         '<input id="swal-input2" class="swal2-input">',
            //       focusConfirm: false,
            //       preConfirm: () => {
            //         return [
            //           document.getElementById('swal-input1').value,
            //           document.getElementById('swal-input2').value
            //         ]
            //       }
            //     })
                
            //     if (formValues) {
            //       Swal.fire(JSON.stringify(formValues))
            //     }
                
            //     })()
        })
    })

    // Deleting
    rows = document.querySelectorAll('.rows .icons #trash')
    rows.forEach(e =>{
        e.addEventListener('click',function(){
            swal({
                title: "¿Estas seguro?",
                text: "Una vez borrado, tu registro será eliminado permanentemente.",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    swal("Poof! El registro ha sido eliminado.", {
                        icon: "success",
                    });
                    let parent_id = e.parentElement.parentElement.getAttribute('id');
                    productsArray.forEach((x, index) =>{
                        if (x.id == parent_id)
                        {
                            // Actualizar suma
                            suma = Number(superTotal.innerHTML.slice(2,superTotal.innerHTML .length));
                            suma -= Number(x.price);
                            superTotal.innerHTML = `$ ${suma}`;
                            // Eliminar elemento
                            productsArray.splice(index,1);
                            savetoCloud(productsArray, superTotal.innerHTML);
                        }
                    })
                    e.parentElement.parentElement.remove();
                } else {
                    swal("Eliminación cancelada");
                }
            });
        })
    })
}