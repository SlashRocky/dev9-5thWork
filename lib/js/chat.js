/* ----------------------------------------
 関数定義
---------------------------------------- */
// 1桁の数字を0埋めで2桁にする
var toDoubleDigits = function(digitNum) {
  digitNum += "";
  if (digitNum.length === 1) {
    digitNum = "0" + digitNum;
  }
  return digitNum;     
};



/* ----------------------------------------
 Firebase
---------------------------------------- */
// Initialize Firebase
var config = {
  apiKey: "AIzaSyA2TnpUjCTm5aE--xzntUIFg5cQJO9v5vM",
  authDomain: "chatapp-fae2b.firebaseapp.com",
  databaseURL: "https://chatapp-fae2b.firebaseio.com",
  projectId: "chatapp-fae2b",
  storageBucket: "chatapp-fae2b.appspot.com",
  messagingSenderId: "522855503192"
};
firebase.initializeApp(config);

// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();

//MSG送受信準備
var newPostRef = firebase.database().ref();

//メッセージ入力欄の要素名を変数messageFieldに格納
var messageField = $('#messageInput');
//ユーザー名入力欄の要素名を変数nameFieldに格納
var nameField = $('#nameInput');
//出力欄の要素名を変数messageListに格納
var messageList = $('#messages');

/* ----------------------------------------
DOMが読み込まれたら
---------------------------------------- */
//ページ最下部を表示
$(window).load(function () {
  $('#scroller').scrollTop($('#messages').height());
});

/* ----------------------------------------
送信ボタンが押されたら
---------------------------------------- */
$('#send2').on('click',function(){
	
  //入力された日時を取得
  var now = new Date();
  //var year = now.getFullYear();
  var month = now.getMonth()+1 ;
  var date = now.getDate();
  var dayNames = [
    '(日)',
    '(月)',
    '(火)',
    '(水)',
    '(木)',
    '(金)',
    '(土)'
  ];
  var day = now.getDay();
  var dayName = dayNames[day];
  var hour = toDoubleDigits( now.getHours() );
  var min = toDoubleDigits( now.getMinutes() );
  var editDay = month + '/' + date + '' + dayName + '　' + hour + ':' + min;
  console.log('editDayは' + editDay);

  //入力されたユーザー名を取得して変数usernameに格納
  var username = nameField.val();
  //入力されたメッセージを取得して変数messageに格納
  var message = messageField.val();
  //入力された時間を変数timeに格納
  var time = editDay;

  //メッセージ入力欄を空にする
  messageField.val('');

  //ページ最下部（最新の投稿）を表示
  $('#scroller').scrollTop($('#messages').height());

  //ファイルのURLを変数imagesに格納する
  var images = document.getElementById("mediaCapture");

  console.log("FILE UPLODE");
  console.log(images);
  
  //画像ファイルがある場合
  if (images.files[0]) {

    var file = images.files[0];
    console.log(file);
    
    var fileName = file.name;
    console.log(fileName);
    
    var storageRef = firebase.storage().ref(fileName);
    storageRef.put(file).then(function(snapshot) {
      console.log('Uploaded a blob or file!');
    });
    
    storageRef.getDownloadURL().then(function(url){
      newPostRef.push({
        name : username,
        text : message,
        time : editDay,
        url : url 
      });
      console.log(url);
      
      //次の投稿に画像ファイル残らないように
      $("#mediaCapture").val("");
      
    })
  }
  
  //ファイルが選択されてない場合
  else {
    
    //データを送信　＝> データベースに保存する
    newPostRef.push({
      name : username,
      text : message,
      time : editDay
    });
    
  }

});

/* ----------------------------------------
データベースにデータが追加されたら
---------------------------------------- */
newPostRef.limitToLast(10).on('child_added',function(snapshot){

  //取得したデータ
  var data = snapshot.val();
  var username = data.name || "anonymous";
  var message = data.text;
  var editDay = data.time;
  var url = data.url;
  
  //自分が投稿した画像データ
  var myImgTag = "";
  if(url){
    myImgTag='<img src="'+ url + '" class="myPhoto">';
  }
  
  //他の誰かが投稿した画像データ
  var yourImgTag = "";
  if(url){
    yourImgTag='<img src="'+ url + '" class="yourPhoto">';
  }
  
  //取得したデータの名前が自分なら
  if( username == nameField.val() ){
    //右側に吹き出しを出す
    var messageElement = $('<li><p class="sender_name me">' + username + '</p><p class="right_balloon">' + message + '</p>'+ myImgTag + '<p class="right_time">' + editDay + '</p><p class="clear_baloon"></p></li>');
  }
  //そうでなかったら左側に吹き出しを出す
  else {
    //左側に吹き出しを出す
    var messageElement = $('<li><p class="sender_name">' + username + '</p><p class="left_balloon">' + message + '</p>' + yourImgTag + '<p class="left_time">' + editDay + '</p><p class="clear_baloon"></p></li>');
  }
  
  //HTMLに取得したデータを追加する
  messageList.append(messageElement);
  

  messageList[0].scrollTop = messageList[0].scrollHeight;
  
});