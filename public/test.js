console.log(firebase);
//
var article_id = 1;
    var article = {
            'title': 'Conectar Firebase con tu app de JavaScript',
    }

    firebase.database().ref('Data/' + article_id).set(article);

firebase.database().ref('Data/' + article_id).once('value').then(
    function(snapshot){
            var title = snapshot.val().title;
            console.log(title);
    }
)