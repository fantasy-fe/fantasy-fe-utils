import React, { Component } from 'react';

export default {
    load () {
        var aMapSDKUrlPrefix = location.protocol + '//webapi.amap.com/maps';
        var aMapSDKUrl = aMapSDKUrlPrefix + '?v=1.3&key=9485a49f9f98bc7ca669f6327dd591ae&callback=mapready';
        var port = document.createElement("script");
        port.async = true;
        port.type = "text/javascript";
        port.src = aMapSDKUrl;
        document.getElementsByTagName("head")[0].appendChild(port);
    },

    create (id, pointInfo, opt) {
        var map = this.map = new AMap.Map(id, {
            resizeEnable: true,
            zoom: 14
        });
        this.setCenter(pointInfo);
        if (opt && opt.showTool) {
            map.plugin(["AMap.ToolBar"],function(){
                //加载工具条
                var tool = new AMap.ToolBar({
                    position: 'LB',
                    ruler: true,
                    direction:true
                });
                map.addControl(tool);
            });
        }

        this.initGeocoder();

    },
    setCenter (pointInfo) {
        var self = this;
        if (typeof pointInfo === 'string') {
            this.map.setCity(pointInfo, function () {
                //self.map.setZoom(14);
            });

        } else if(pointInfo.lng && pointInfo.lat) {
            this.map.setZoomAndCenter(14, [pointInfo.lng, pointInfo.lat]);
        }
    },
    addMarker (pointInfo) {
        if (pointInfo && pointInfo.lng && pointInfo.lat) {
            var pos = new AMap.LngLat(pointInfo.lng,pointInfo.lat);
            if (this.iconUrl) {
                this.addCustomerMarker(pointInfo, this.iconUrl);
            } else {
                var marker = new AMap.Marker({
                    map:this.map,
                    position:pos,
                });
            }
        }
    },
    addCustomerMarker (pointInfo, iconUrl) {
        if (!iconUrl) {
            this.addMarker(pointInfo);
        }
        if (pointInfo && pointInfo.lng && pointInfo.lat) {
            var pos = new AMap.LngLat(pointInfo.lng,pointInfo.lat);
            new AMap.Marker({
                map: this.map,
                position: pos,
                icon:  new AMap.Icon({
                    size: new AMap.Size(34, 45),  //图标大小
                    image: iconUrl
                }),
                offset : new AMap.Pixel(-17,-40),
            });
        }
    },
    clearMarker () {
        this.map.clearMap();
    },

    initGeocoder () {
        var self = this;
        AMap.service(["AMap.Geocoder"], function () {
            self.geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all"
            });
        });
    },
    getAddress (lnglatInfo, callback) {
        var self = this;
        var lnglatXY = new AMap.LngLat(lnglatInfo.lng, lnglatInfo.lat);
        if (!this.geocoder) {
            this.initGeocoder();
            setTimeout(function () {
                self.getAddress(lnglatInfo, callback);
            }, 100);
        } else {
            this.geocoder.getAddress(lnglatXY, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var addrComp = result.regeocode.addressComponent;
                    /*var _city = addrComp.city || addrComp.province;
                     addrComp.city = self.formatCityname(_city);*/
                    var poiList = result.regeocode.pois.map(function (poi) {
                        return {
                            poiId: poi.id,
                            name: poi.name,
                            address: poi.address || poi.name,
                            lng: poi.location.lng,
                            lat: poi.location.lat,
                            city: addrComp.city || addrComp.province,
                            citycode: addrComp.citycode,
                            province: addrComp.province,
                            district: addrComp.district,
                        };
                    });
                    callback(poiList);
                } else {
                    callback(status);
                }
            });
        }

    },
    getPoint (city, address, fn) {
        var self = this;
        if (!this.geocoder) {
            this.initGeocoder();
            setTimeout(function () {
                self.getPoint(city, address, fn);
            }, 100);
        } else {
            //地理编码,返回地理编码结果
            this.geocoder.getLocation(address, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var geocodes = result.geocodes;
                    if (geocodes.length > 0) {
                        var point = {
                            lng: geocodes[0].location.getLng(),
                            lat: geocodes[0].location.getLat(),
                        };
                        fn(point);
                    }
                }
            });
        }
    },
    placeSearch (city, keyword, fn) {
        //http://lbs.amap.com/api/javascript-api/reference/search/
        var self = this;
        var callback = function (status, result) {
            var s = [];
            if (status === 'complete' && result.info === 'OK') {
                var pois = result.poiList.pois;
                for (var i = 0; i < pois.length; i++) {
                    var poiExist = false;
                    var poi = pois[i];
                    var cityObj = {
                        poiId: poi.id,
                        name: poi.name,
                        address: poi.address || poi.name,
                        lng: poi.location.lng,
                        lat: poi.location.lat,
                        province: poi.pname,
                        areaname: poi.adname,
                        citycode: poi.citycode
                    };
                    if(poi.adname.indexOf(city) > -1) {
                        cityObj.city = poi.adname;
                        poiExist = true;
                    }
                    if(poi.cityname.indexOf(city) > -1) {
                        cityObj.city = poi.cityname;
                        poiExist = true;
                    }
                    if(poi.pname.indexOf(city) > -1) {
                        cityObj.city = poi.pname;
                        poiExist = true;
                    }
                    if(poiExist) {
                        s.push(cityObj);
                    }
                }
            }
            fn(s);
        };
        var AMap = window.AMap;
        AMap.service(['AMap.PlaceSearch'], function () {
            var placeSearch = new AMap.PlaceSearch({
                // 构造地点查询类
                pageSize: 10,
                pageIndex: 1,
                city: city,
                // 城市
                extensions: 'all'
            });
            placeSearch.search(keyword, callback);
        });
    },
    initDrive () {
        var self = this;
        AMap.service(["AMap.Driving"], function () {
            var DrivingOption = {
                //驾车策略，包括 LEAST_TIME，LEAST_FEE, LEAST_DISTANCE,REAL_TRAFFIC
                policy: AMap.DrivingPolicy.LEAST_TIME
            };
            self.mapdrive = new AMap.Driving(DrivingOption); //构造驾车导航类
        });
    },
    drivingRoute (startPoint, endPoint, fn) {
        var self = this;
        if (!this.mapdrive) {
            this.initDrive();
            setTimeout(function () {
                self.drivingRoute(startPoint, endPoint, fn);
            }, 100);
        } else {
            var sPoint = new AMap.LngLat(startPoint.lng, startPoint.lat);
            var ePoint = new AMap.LngLat(endPoint.lng, endPoint.lat);
            //根据起终点坐标规划驾车路线
            this.mapdrive.search(sPoint, ePoint, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var distance = parseFloat(result.routes[0].distance).toFixed(2);
                    var time = parseFloat(result.routes[0].time / 60).toFixed(1);
                    fn({
                        duration: time,
                        distance: distance
                    });
                }
            });
        }
    },
    bindMapClick (fn) {
        var self = this;
        AMap.event.addListener(this.map,'click',function(e){
            self.clearMarker();
            var lnglat = e.lnglat;
            self.addMarker({lng:lnglat.lng,lat:lnglat.lat});
            self._getAddress(lnglat, function(result) {
                if (result) {
                    fn(result);
                }
            });
        });
    },
    _getAddress (lnglat, fn) {
        var self = this;
        this.geocoder.getAddress([lnglat.lng,lnglat.lat], function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                var addressComponent = result.regeocode.addressComponent;
                /*addressComponent.city = self.formatCityname(addressComponent.city);
                 var _city = addressComponent.city || addressComponent.province;
                 addressComponent.city = self.formatCityname(_city);*/
                var pois = result.regeocode.pois;
                var poi;
                if (pois.length >0 ) {
                    poi = pois[0];
                    var res = {
                        poiId: poi.id,
                        name: poi.name,
                        address: poi.address || poi.name,
                        lng: lnglat.lng,
                        lat: lnglat.lat,
                        city: addressComponent.city || addressComponent.province,
                        citycode: addressComponent.citycode,
                        district: addressComponent.district,
                        province: addressComponent.province,
                    };
                    fn(res);
                } else {
                    fn(null);
                }
            }
        });
    },
    setCenterAndZoom (pointInfo, fn) {
        this.clearMarker();
        this.map.setZoomAndCenter(14, [pointInfo.lng, pointInfo.lat]);
        this.addMarker(pointInfo);
    },
    setViewport(points) {
        this.map.setFitView();
    },
    /*
     * 绘制圆形
     */
    createCircle (opts) {
        var radius = opts.radius || 1000;
        var fillcolor = opts.fillcolor || 'blue';
        var mPoint;
        if (!opts.lng || !opts.lat) {
            mPoint = new AMap.LngLat(116.403322, 39.920255);
        } else {
            mPoint = new AMap.LngLat(opts.lng, opts.lat);
        }

        var circle = new AMap.Circle({
            center: mPoint,// 圆心位置
            radius: radius, //半径
            strokeColor: fillcolor, //线颜色
            strokeOpacity: 0.35, //线透明度
            strokeWeight: 1, //线粗细度
            fillColor: fillcolor, //填充颜色
            fillOpacity: 0.35//填充透明度
        });
        circle.setMap(this.map);
        this.map.setZoomAndCenter(14, [opts.lng, opts.lat]);
        return circle;
    },

    removeCircle (circle) {
        circle.setMap(null);
    }
}