const login = document.querySelector('.login');
const signup = document.querySelector('.signup');
const forget = document.querySelector('#forget');
const submit = document.getElementById('submit');
const inputEmail = document.getElementById('email');
const inputPass = document.getElementById('password');

let flag = true;

const changeColor = () =>{
    if (flag == true) 
    {
        login.style.backgroundColor = 'black';
        login.style.color = 'Gainsboro';
        login.style.fontSize = '24px';
        signup.style.background = 'white';
        signup.style.color = 'black';
        signup.style.fontSize = '60px';
    }
    else
    {
        login.style.background = 'white';
        login.style.color = 'black';
        login.style.fontSize = '60px';
        signup.style.background = 'black';
        signup.style.color = 'Gainsboro';
        signup.style.fontSize = '24px';
    }
    flag = !flag;
}

login.addEventListener('click', changeColor);
signup.addEventListener('click', changeColor);
forget.addEventListener('click',() =>{
    swal('Por favor introduzca su correo electrónico. Un mensaje será enviado para que pueda reestablecer su contraseña',{
        content: {
          element: "input",
          attributes: {
            placeholder: "Escriba su correo electrónico",
            type: "email",
            color: 'black',
          },
        },
    })
    .then((value) =>
    {
        if (validateEmail(value))
        {
            firebase.auth().sendPasswordResetEmail(value)
            .then(function() {
                swal("¡Envio exitoso!", "Se ha mandado un correo de reestablecimiento a la dirección indicada", "success");
            })
            .catch(function(error) {
                console.log(error.message);
                if (error.code == 'auth/user-not-found')
                {
                    swal("Error!", "Lo sentimos, pero el correo proporcionado no tiene una cuenta asociada.", "error");
                }
            });
        }
        else
        {
            swal("Error!", "Por favor introduzca una dirección de correo valida", "error");
        }
    });
})

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const enter = () => {
    const email = inputEmail.value;
    const pass = inputPass.value;
    if (validateEmail(email))
    {
        if (pass.length < 6)
        {
            swal("Error!", "Por favor introduzca una contraseña mayor a 6 caracteres", "error");
        }
        else
        {
            const auth = firebase.auth();
            if (flag == true)
            {
                //Login
                const promise = auth.signInWithEmailAndPassword(email, pass);
                promise.catch(e => {
                    console.log(e.message)
                    if (e.code == "auth/user-not-found")
                    {
                        swal("Error!", "Lo sentimos, pero el correo proporcionado no esta registrado", "error");
                    }
                    else if (e.code == 'auth/wrong-password')
                    {
                        swal("Error!", "Lo sentimos, pero la contraseña introducida no es correcta", "error");
                    }
                });
            }
            else
            {
                //Signup
                const promise = auth.createUserWithEmailAndPassword(email, pass);
                promise.catch(e => {
                    console.log(e.message)
                    if (e.code == 'auth/email-already-in-use')
                    {
                        swal("Error!", "El correo proporcionado ya cuenta con una cuenta.", "error");
                    }
                });
            }
        }
    }
    else
    {
        swal("Error!", "Por favor introduzca una dirección de correo valida", "error");
    }
}

submit.addEventListener('click', enter);
document.addEventListener('keypress',logkey => {
    if (logkey.code == 'Enter')
    {
        enter();
    }
})

firebase.auth().onAuthStateChanged(firebaseUser =>{
    if (firebaseUser)
    {
        window.location.href = 'lista.html';
    }
    else
    {
        console.log('not logged in');
    }
})