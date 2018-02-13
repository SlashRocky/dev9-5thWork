/* ----------------------------------------
変数定義
---------------------------------------- */
//マップのインスタンスを格納する変数
var map;

//取得したjsonデータを格納する変数
var jsonData;

//ピンの配列を格納する変数
var markersArray = [];

//カテゴリボタンの変数
var navList = document.querySelectorAll('#header-inner a');

//これから非表示にするピンの配列を格納する変数
var newClearMarkersArray = [];

//すでに非表示になっているピンの配列を格納する変数
var currentClearMarkersArray = [];

//店舗名を表示する吹き出しを格納する変数
var infoWindow;



/* ----------------------------------------
イベント設定
---------------------------------------- */

/* DOMが読み込まれたら
---------------------------------------- */
$(function(){
	
  //initMap関数実行
  initMap();
	
  //jsonDataに格納されているお店の数だけfor文で回す
  for (var i = 0; i < navList.length; i++) {

    navList[i].addEventListener('click', function (e) {

      //デフォルトのイベントを無効化
      e.preventDefault();

      //クリックしたナビのテキストを保存
      var thisTxt = this.textContent;
			
      //ピンの表示/非表示
      toggleShowMarkers(thisTxt);

    });

  }
	
});



/* ----------------------------------------
関数定義
---------------------------------------- */

/* 成功した時に実行される関数
---------------------------------------- */
function init(position){

  //現在地の緯度取得
  const lat = position.coords.latitude;
  //現在地の経度取得
  const lon = position.coords.longitude;
  //変数myLatLngオブジェクトに現在値の緯度と経度を格納
  var myLatLng = {
    lat: lat,
    lng: lon
  };

  //HTMLの#mapに、zoom3、中心地→現在地で表示
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: myLatLng
  });

  //現在値のピンを'marker'という変数で作成
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'CoinMap',
    icon: 'lib/img/icon/icon_here.png'
  });
  
  //ビットコインが使えるお店のピンの初期設定
  initMaker();
}

/* ビットコインが使えるお店のピンの初期設定の関数
---------------------------------------- */
function initMaker(){
  
  //jsonDataに格納されているデータ数確認
  console.log(jsonData.length);
  
  //jsonDataが存在するなら
  if(jsonData){
    
    for(var i = 0; i < jsonData.length; i++){
      
      //i番目のデータを変数elementに格納
      var element = jsonData[i]
      
      //アイコンのパスを変数imageに格納
      var image;
      
      //アイコンの画像はカテゴリによって分ける
      if( element['category'] === 'atm' ){
        image = 'lib/img/icon/icon_atm.png';
      }
      else if( element['category'] === 'attraction' ){
        image = 'lib/img/icon/icon_attraction.png';
      }
      else if( element['category'] === 'cafe' ){
        image = 'lib/img/icon/icon_cafe.png';
      }
      else if( element['category'] === 'default' ){
        image = 'lib/img/icon/icon_default.png';
      }
      else if( element['category'] === 'food' ){
        image = 'lib/img/icon/icon_food.png';
      }
      else if( element['category'] === 'grocery' ){
        image = 'lib/img/icon/icon_grocery.png';
      }
      else if( element['category'] === 'lodging' ){
        image = 'lib/img/icon/icon_lodging.png';
      }
      else if( element['category'] === 'nightlife' ){
        image = 'lib/img/icon/icon_nightlife.png';
      }
      else if( element['category'] === 'shopping' ){
        image = 'lib/img/icon/icon_shopping.png';
      }
      else if( element['category'] === 'sports' ){
        image = 'lib/img/icon/icon_sports.png';
      }
      else if( element['category'] === 'transport' ){
        image = 'lib/img/icon/icon_transport.png';
      }
			
      //ピンの作成
      var marker = new google.maps.Marker({
        
        //位置設定
        position: {
          lat: Number(element['lat']),
          lng: Number(element['lon'])
        },
        
        //表示するマップ設定
        map: map,
        
        //アイコン画像設定
        icon: image,
        
        //必要な情報を取得
        detail: {
          name: element['name'],
		  category: element['category']
        }
        
      });
			
      //ピンのオブジェクトを配列markersArrayに格納
      markersArray.push(marker);
      
      //ピンの情報を表示するウィンドウ
      infoWindow = new google.maps.InfoWindow();
      
      //ピンをクリックした時の処理
      marker.addListener('click',function(){
        
        //店舗情報を作成
        makeInfo(this.detail);
        
        //作成した店舗情報を表示
        showInfo();

        //そのピンの地点を拡大表示
        panZoomMap(this.position.lat(), this.position.lon(),16)

      });
      
      //ピンをマウスオーバーした時の処理
      marker.addListener('mouseover',function(){
        infoWindow.setContent(this.detail.name);
        infoWindow.open(map,this);
      });
    }
  }
  
  //jsonDataが空なら
  else{
    alert('データの読込に失敗しました。')
  }
  
}

/* カテゴリ別でピンを表示/非表示する関数
---------------------------------------- */
function toggleShowMarkers(categoryName) {
	
  //categoryNameを確認
  console.log(categoryName);
	
  //非表示になっているピンがあれば表示する
  if (currentClearMarkersArray.length !== 0) {
		
    for (var i = 0; i < currentClearMarkersArray.length; i++) {
      currentClearMarkersArray[i].setMap(map);
    }

  }
  
  //クリックしたテキストがcoinmap(ロゴ)だったら以降の処理を行わない
  if (categoryName.toLowerCase() === 'coinmap') {
    return;
  }
  
  //クリックされたカテゴリ以外の要素の配列を取得
  newClearMarkersArray = markersArray.filter(function (elm) {

    //categoryNameを確認
    console.log(categoryName);

    return elm.detail.category !== categoryName.toLowerCase();

  });
	
  //クリックされたカテゴリ以外の要素を非表示にする
  for (var i = 0; i < newClearMarkersArray.length; i++) {
    newClearMarkersArray[i].setMap(null);
  }
  
  //新しく取得した配列を次に表示させるために代入
  currentClearMarkersArray = newClearMarkersArray;
}

/* 指定位置を中心に地図を拡大・移動する関数
---------------------------------------- */
function panZoomMap(lat, lon, zoomNum){
  map.panTo(new google.maps.LatLng(Number(lat),Number(lon)));
  map.setZoom(Number(zoomNum));
}

/* 失敗した時に実行される関数
---------------------------------------- */
function err(error){

  const e = error.code;

  if(e == 1){
    alert('取得許可が得られませんでした');
  }
  if(e == 2){
    alert('座標取得ができませんでした');
  }
  if(e == 3){
    alert('TimeOut');
  }

}

/* オプション設定　
---------------------------------------- */
const option = {

  enableHighAccuracy : true,
  timeout : 10000,
  maximumAge : 10000

}

/* 成功したらinit関数を呼ぶ 失敗したらerr関数を呼ぶ
---------------------------------------- */
function initMap(){
  navigator.geolocation.getCurrentPosition(init,err,option);
}