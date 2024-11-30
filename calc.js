import LatLon from 'https://cdn.jsdelivr.net/npm/geodesy@2.2.1/latlon-spherical.min.js';

export class CalcVR {
    constructor() {
        this.distance = 0;
        this.bearing = 0;
        this.newPosition = [0, 0];
        this.currentPosition = [0, 0];
        this.objectSize = '0, 0, 0';
        this.newDistance = 800;
    }
    // 距離と方角を計算
    calcDist(currentPosiArg, targetPosition) {
        const current = new LatLon(currentPosiArg[0], currentPosiArg[1]);
        const target = new LatLon(targetPosition[0], targetPosition[1]);
        this.distance = current.distanceTo(target);
        this.bearing = current.finalBearingTo(target)
        this.currentPosition = currentPosiArg;
    }
    //表示位置を計算
    calcNewPosition(currentPosition, bearing, newTargetToDistance) {
        const current = new LatLon(currentPosition[0], currentPosition[1]);
        const calculatedlced = current.destinationPoint(newTargetToDistance, bearing);
        this.newPosition = [calculatedlced.latitude, calculatedlced.longitude];
    }
    // サイズを計算
    calcSizeDist(distance) {
        if(distance <= 1000 && distance >= 500){
//            this.objectSize = '25 25 25';
//            this.objectSize = '2.5 2.5 2.5';
//            this.objectSize = '1.2 1.2 1.2';
            this.objectSize = '1.0 1.0 1.0';
            this.newDistance = 800;
        }else if(distance > 1000 && distance <= 8000) {
//            this.objectSize = '20 20 20';
//            this.objectSize = '2.0 2.0 2.0';
//            this.objectSize = '1.0 1.0 1.0';
            this.objectSize = '0.9 0.9 0.9';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 8000 && distance <= 16000) {
//            this.objectSize = '18 18 18';
//            this.objectSize = '1.8 1.8 1.8';
//            this.objectSize = '0.9 0.9 0.9';
            this.objectSize = '0.8 0.8 0.8';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 16000 && distance <= 20000) {
//            this.objectSize = '15 15 15';
//            this.objectSize = '1.5 1.5 1.5';
//            this.objectSize = '0.7 0.7 0.7';
            this.objectSize = '0.6 0.6 0.6';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 20000) {
//            this.objectSize = '10 10 10';
//            this.objectSize = '1 1 1';
//            this.objectSize = '0.5 0.5 0.5';
            this.objectSize = '0.3 0.3 0.3';
            this.newDistance = 800 + (distance/1000);
        }
    }

}
window.onload = () => {
    navigator.geolocation.getCurrentPosition(success, error, options);
};

// 目的地情報を追加。19個くらいまでは大丈夫そう。
function staticLoadPlaces() {
    return [
        {
            name: 'ship',
            modelName: 'https://shimizukobo.github.io/sunokawa/assets/tree.glb',
            location: {
                lat: 32.96362312122428,
                lng: 132.57338899298833,
            }
        },

    ];
}

// 描画するため、a-sceneに追加。
function renderPlaces(places, pos) {
    let scene = document.querySelector('a-scene');
    var crd = pos.coords;
    let cal = new CalcVR();
    var jsonAltitude = 0;

        jsonAltitude = pos.coords.altitude;
//alert("標高 " + jsonAltitude);
        if(jsonAltitude == 'undefind') {
        //if(jsonAltitude == null) {
            jsonAltitude = 0;
        }
        else{
            jsonAltitude = jsonAltitude - 33;
//            jsonAltitude = 250;
        }    
alert("\nちゃんと撮れるかな ver1.0.0\n須ノ川のクリスマスツリーを見るブラウザAR\n緯度 " + pos.coords.latitude + "\n経度 " + pos.coords.longitude + "\n標高 " + jsonAltitude + "\nボタンをタップすると撮影できます。\n\n初回の起動時には、位置情報を取得がうまくいかない場合は、\n少し時間をおいてブラウザの更新をしてください。");
//jsonAltitude = -(jsonAltitude/2);

    
    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        let name = place.name;
        let modelName = place.modelName;
        cal.calcDist([crd.latitude, crd.longitude], [latitude, longitude]);
        cal.calcNewPosition(cal.currentPosition, cal.bearing, cal.newDistance);
        cal.calcSizeDist(cal.distance);
        
jsonAltitude = -(jsonAltitude*(cal.newDistance/cal.distance));
       
        let model = document.createElement('a-entity');
//        model.setAttribute('look-at', '[gps-camera]');    //正面を向ける
        model.setAttribute('look-at', '');    //向きを固定する
        model.setAttribute('gps-entity-place', `latitude: ${cal.newPosition[0]}; longitude: ${cal.newPosition[1]};`);
//        model.setAttribute('gps-entity-place', `latitude: ${place.location.lat}; longitude: ${place.location.lng};`);
        model.setAttribute('gltf-model', `${modelName}`);
//        model.setAttribute('position', '0 0 -${jsonAltitude}');
        model.setAttribute('position', '0 '+jsonAltitude+' 0');
        model.setAttribute('animation-mixer', '');
        model.setAttribute('scale', `${cal.objectSize}`);

        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        scene.appendChild(model);
    });
}

var options = {
    enableHighAccuracy: true,
    timeout: 50000,
    maximumAge: 0
  };

  
function success(pos) {
    let places = staticLoadPlaces();
    renderPlaces(places, pos);
}
  
function error(err) {
   console.warn(`ERROR(${err.code}): ${err.message}`);
   alert('Unable to capture current location.');
 }


function test(elevation) {
    test2(position,elevation);
    navigator.geolocation.getCurrentPosition(position);
}

function test2(position,elevation) {

    //まず現在地の緯度経度を取得する
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    //国土地理院API用に有効桁数を合わせる。
    var adjustiveLat = lat + "00";
    var adjustiveLon = lon + "0";

    //文字列に変換
    var stringLat = String(adjustiveLat);
    var stringLon = String(adjustiveLon);

    //国土地理院APIに現在地の緯度経度を渡して、標高を取得する
    const url = 'http://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=' + stringLon + '&lat=' + stringLat + '&outtype=JSON';

//    console.log(url);
    elevation = 0;
    
    fetch(url).then(function(response) {
      return response.text();
    }).then(function(text) {
//      console.log(text);
      
      //取得したjsonをパース
      var jsonAltitude = JSON.parse(text);
        elevation = jsonAltitude.elevation;
//      console.log("標高：" + jsonAltitude.elevation + "m");

      //ポップアップ表示
//      alert("現在地の標高は" + jsonAltitude.elevation + "mです。" +  "(" + "緯度：" + stringLat + "、経度：" + stringLon + ")")

    });

}    
