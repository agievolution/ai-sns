
function showAlert(message) {
    alertMessage.textContent = message; // Set the message content
    alertBox.classList.add('show');

    // Clear any existing timeout to prevent issues with multiple clicks
    clearTimeout(timeoutId);

    // Set a new timeout to hide the alert after 1.5 seconds
    timeoutId = setTimeout(hideAlert, 4500);
}

function hideAlert() {

    alertBox.classList.remove('show');
}


const FETCH_RETRIES = 30;
const INITIAL_RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 80000;

async function loadPersonsData(url, retries = FETCH_RETRIES, retryDelay = INITIAL_RETRY_DELAY) {
    // 验证输入参数
    if (typeof url !== 'string' || !url.trim()) {
        throw new Error('无效的URL参数');
    }

    // 内部函数处理请求
    async function fetchData(retriesLeft, delay) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {

            console.log(`剩余重试次数: ${retriesLeft}`);

            // 添加随机查询参数以防止缓存
            const fetchUrl = new URL(url);
            fetchUrl.searchParams.set('t', Date.now());

            const response = await fetch(fetchUrl.toString(), {
                signal: controller.signal,
                cache: 'no-cache'
            });



            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status} ${response.statusText}`);
            }

            // 尝试解析JSON数据
            const data = await response.json();
            // showAlert(`请求成功，返回数据: ${data}`);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            // 检查是否是超时错误
            if (error.name === 'AbortError') {
                console.error('请求超时被取消');
                showAlert('请求超时被取消');
                throw new Error('请求超时');
            }

            // 重试逻辑
            if (retriesLeft > 0) {
                console.warn(`请求失败，错误: ${error.message}. 剩余重试次数: ${retriesLeft}。将在 ${delay}ms 后重试...`);
                showAlert(`请求数据失败，剩余重试次数: ${retriesLeft}。将在 ${delay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchData(retriesLeft - 1, delay * 1);
            }

            console.error('最终请求失败:', error.message);
            showAlert(`最终请求失败: ${error.message}`);
            throw error;
        }
    }

    return fetchData(retries, retryDelay);
}

// 使用立即执行函数封装异步操作 loadPersonsData
(async () => {
    try {
        const dataUrl = "http://www.ai-sns.org/personsdata.json";
        const data = await loadPersonsData(dataUrl);
        console.log("成功加载人员数据:", data);
        showAlert(`Person data loaded.`);
        personsdata = data;
        showpoints();
    } catch (error) {
        console.error("人员数据加载失败，建议:",
            error.name === 'AbortError'
                ? '检查网络连接或稍后重试'
                : '联系系统管理员');
    }
})();



function findMeshes(object) {
    const meshes = [];
    object.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
var highlightedObject = null;
// 加载 3D 模型
var all_model_meshes = [];
var loader = new THREE.GLTFLoader();
var loader2 = new THREE.GLTFLoader();
// 模型加载重试函数
async function loadModelWithRetry(loaderInstance, url, retries = 3, retryDelay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const gltf = await new Promise((resolve, reject) => {
                // 监听加载错误
                const errorHandler = (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                };

                // 加载模型
                loaderInstance.load(
                    url,
                    (gltf) => {
                        clearTimeout(timeoutId);
                        resolve(gltf);
                    },
                    undefined,
                    errorHandler
                );
            });

            return gltf;
        } catch (error) {
            console.error(`模型加载失败 (尝试 ${attempt}/${retries}): ${error.message}`);

            if (attempt < retries) {
                console.log(`将在 ${retryDelay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2; // 指数退避
            } else {
                throw new Error(`模型加载失败，已重试 ${retries} 次: ${error.message}`);
            }
        }
    }
}
function initMap() {
    // 配置选项
    const LOADER_OPTIONS = {
        apiKey: "AIzaSyDPXsp-NFBn5AvyaYn71u4m3fgblsUjR8Y",
        version: "weekly",
    };
    // Levi’s Stadium 球场的边界坐标
    const coordinates = [
        {lng: -73.9702904, lat: 40.7634362},
        {lng: -73.9698018, lat: 40.7627095},
        {lng: -73.9693109, lat: 40.762918},
        {lng: -73.969804, lat: 40.7636465},
    ];
    const center = {lng: 116.27882, lat: 39.71164, altitude: 0};


    const DEFAULT_COLOR = 0xffffff;
    const HIGHLIGHT_COLOR = 0xff0000;
    const mapStyles = [
        // 隐藏所有 POI
        {
            featureType: "poi",
            elementType: "all",
            stylers: [{visibility: "off"}]
        }
    ];
    const mapOptions = {
        center,
        // mapId: "7057886e21226ff7",//没有路名等相关内容
        mapId: "b8fc4b5a8471b933",
        // renderingType: google.maps.RenderingType.VECTOR,
        // styles: mapStyles,
        zoom: 17,
        //      draggableCursor: 'crosshair',
        // draggingCursor: 'crosshair',
        tilt: 67.5,
        disableDefaultUI: true,
        backgroundColor: "transparent",
        gestureHandling: "greedy",
    };

    // // 创建地图和覆盖层
    // const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //
    // const overlay = new google.maps.plugins.three.ThreeJSOverlayView({map, anchor: center, upAxis: "Y"});
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    geocoder = new google.maps.Geocoder();
    marker = new google.maps.Marker({
        map,
        draggable: true
    });
    marker.addListener("dragend", (event) => {
        const position = marker.getPosition();
        console.log(position);
        var address_input = document.getElementById("address");
        const latlng = {
            lat: parseFloat(position.lat()),
            lng: parseFloat(position.lng()),
        };
        geocoder
            .geocode({location: latlng})
            .then((response) => {
                if (response.results[0]) {
                    address_input.value = response.results[0].formatted_address;

                    const location_result = latlng;
                    //location_result is readonly
                    init_position = {
                        lng: location_result.lng,
                        lat: location_result.lat,
                        altitude: 0,
                        scale: 20
                    };
                    const init_position_str = JSON.stringify(init_position);
                    update_map_setting("home_position", init_position_str)


                } else {
                    window.alert("No results found");
                }
            })
            .catch((e) => window.alert("Geocoder failed due to: " + e));

    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        map,
        // panel: document.getElementById("panel"),
    });
    directionsRenderer.addListener("directions_changed", () => {

        const directions = directionsRenderer.getDirections();
        if (directions) {
            computeTotalDistance(directions);
        }
    });
    initialize_route();
    const tmpcenter = {lat: 39.71164, lng: 116.27882};
    // overlay = new google.maps.plugins.three.ThreeJSOverlayView({map, anchor: center, upAxis: "Y"});
    overlay = new google.maps.plugins.three.ThreeJSOverlayView({
        map,
        anchor: tmpcenter,
        upAxis: "Y"
    });

    const mapDiv = map.getDiv();
    const mousePosition = new THREE.Vector2();
    console.log("intimouseposition:", mousePosition);

    map.addListener("click", (e) => {
        // alert(1);
        last_click_point = e.latLng;
        center_point = getCenter();
        alert("lastpoint:" + JSON.stringify(e.latLng.toJSON(), null, 2));
        alert("center_point:" + JSON.stringify(center_point.toJSON(), null, 2));
        distance = getDistance(last_click_point, center_point);
        alert(distance);
        // showinfo();
        // setTimeout(moveinfo, 1500);
        const domEvent = e.domEvent;
        const {left, top, width, height} = mapDiv.getBoundingClientRect();
        const x = domEvent.clientX - left;
        const y = domEvent.clientY - top;
        mousePosition.x = 2 * (x / width) - 1;
        mousePosition.y = 1 - 2 * (y / height);

        if (instruct_to_move_flag == true) {
            const tmpcenter = {lat: 39.71164, lng: 116.27882};
            // overlay = new google.maps.plugins.three.ThreeJSOverlayView({map, anchor: center, upAxis: "Y"});
            // overlay.setAnchor(tmpcenter);
            const coordinates = getLastClickPoint();
            // overlay.setAnchor(coordinates);
            const position = overlay.latLngAltitudeToVector3(coordinates);
            console.log("model.positiona24", model.position)
            console.log("model.positionxa24", model.position.x)
            console.log("model.positionza24", model.position.z)
            console.log("position", position)
            const position2 = overlay.latLngAltitudeToVector3(coordinates, model.position);
            console.log("position2", position2)
            console.log("model.position", model.position)
            console.log("model.positionx", model.position.x)
            console.log("model.positionz", model.position.z)
        }

        overlay.requestRedraw();
    });
    map.addListener("zoom_changed", () => {
        const zoomLevel = map.getZoom();
        console.log("当前缩放级别:", zoomLevel);
    });

    const contentString = "<div style='font-size:20px'>Hello,I'm CBot.Nice to meet you.</div>";

    const offsetpoint = new google.maps.Size(20, -150);
    var infowindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: "Uluru",
        headerDisabled: true,
        position: {
            lat: 40.76971146231474,
            lng: -73.97265643012797,
            altitude: 520
        },
        pixelOffset: offsetpoint,
    });
    const uluru = {lat: 40.76971146231474, lng: -73.97265643012797};
    const latLngAltitudeLiteral2 = {
        lat: 40.76726879657253,
        lng: -73.97383222939642,
        altitude: 80,
    };
    function showinfo() {
        infowindow.open({
            anchor: null,
            map,
        });
    }
    function moveinfo() {
        infowindow.close();
        const contentString2 = "<div style='font-size:20px'>Nice to meet you.How can I go to AI-SNS Center.</div>";
        const offsetpoint2 = new google.maps.Size(-140, -150);
        var infowindow2 = new google.maps.InfoWindow({
            content: contentString2,
            ariaLabel: "Uluru",
            headerDisabled: true,
            position: {
                lat: 40.76971146231474,
                lng: -73.97265643012797,
                altitude: 520
            },
            pixelOffset: offsetpoint2,
        });

        const opt = {
            content: contentString2,
            ariaLabel: "Uluru",
            headerDisabled: true,
            position: {
                lat: 40.76971146231474,
                lng: -73.97265643012797,
                altitude: 520
            },
            pixelOffset: offsetpoint2,
        }
        infowindow2.open({
            anchor: null,
            map,
        });
        setTimeout(() => {
            // 关闭信息窗口
            infowindow2.close();
            console.log("信息窗口已关闭"); // 便于调试，输出关闭信息
        }, 2000);
    }

// 使用 async/await 处理异步加载，确保模型完全加载后再执行后续操作
    const loadHouse = async () => {
        try {
            // 使用重试机制加载模型
            const gltf = await loadModelWithRetry(loader, 'house_red.glb');
            modelhouse = gltf.scene;
            // 添加环境光
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
            //overlay.scene.add(ambientLight);
            // 添加平行光
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
            directionalLight.position.set(-1, -1, -1); // 光源位置设置在模型的背面
            // overlay.scene.add(directionalLight);
            // 计算模型的包围体积
            const box = new THREE.Box3().setFromObject(modelhouse);
            const size = box.getSize(new THREE.Vector3());
            const height = size.y; // 模型的高度
            console.log("房屋模型高度:", height);
            // 设置模型的缩放、旋转和位置
            modelhouse.scale.set(1, 1, 1);
            modelhouse.rotation.x = (Math.PI / 15) * 0;
            modelhouse.rotation.y = (Math.PI / 15) * 1.6;
            const position3 = overlay.latLngAltitudeToVector3(init_position, modelhouse.position);
            // 将模型添加到场景中
            overlay.scene.add(modelhouse);
            console.log("房屋模型加载成功");
            modelLoadStatus.house = true;
            checkAnimationStart();
        } catch (error) {
            console.error('房屋模型加载失败:', error);
        }
    };
    loadHouse();
    const loadModel = async () => {
        try {
            // 使用重试机制加载模型
            const gltf = await loadModelWithRetry(loader, 't-shirtgirl2.glb');
            model = gltf.scene;
            // 添加环境光
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
            //overlay.scene.add(ambientLight);
            // 添加平行光
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
            directionalLight.position.set(-1, -1, -1); // 光源位置设置在模型的背面
            // overlay.scene.add(directionalLight);
            // 计算模型的包围体积
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const height = size.y; // 模型的高度
            console.log("女孩模型高度:", height);
            // 根据高度调整缩放比例
            const desiredHeight = 150; // 期望的高度
            const scale = desiredHeight / height;
            // 设置模型的缩放、旋转和位置
            model.scale.set(scale, scale, scale);
            model.rotation.x = Math.PI / 30;
            model.rotation.y = Math.PI / 1.5;
            model.position.set(60, 0, -250);
            // 将模型添加到场景中
            overlay.scene.add(model);
            // 查找场景中的所有网格
            const modelMeshes_found = findMeshes(gltf.scene);
            // 将找到的网格添加到全局数组
            all_model_meshes.push(...modelMeshes_found);
            // 给模型添加点击事件
            model.traverse((child) => {
                if (child.isMesh) {
                    child.cursor = 'pointer';
                    child.userData.isClickable = true;
                }
            });
            // 创建动画混合器并播放动画
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                const action = mixer.clipAction(gltf.animations[0]);
                mixer.timeScale = 0.5;
                action.setDuration(1).play();
                mixers.push(mixer);
                console.log("女孩模型动画已启动");
            }
            console.log("女孩模型加载成功");
            modelLoadStatus.girl = true;
            checkAnimationStart();
        } catch (error) {
            console.error('女孩模型加载失败:', error);
        }
    };
// 调用 loadModel 函数
    loadModel();
    // 加载AI-SNS建筑模型（假设功能类似）

    load_aisns_building();
    const loadModel2 = async () => {
        try {
            // 使用重试机制加载模型
            const gltf = await loadModelWithRetry(loader, 't-shirtboy2.glb');
            model2 = gltf.scene;
            // 添加环境光
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
            //overlay.scene.add(ambientLight);
            // 添加平行光
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);

            directionalLight.position.set(-1, -1, -1); // 光源位置设置在模型的背面
            // overlay.scene.add(directionalLight);
            // 计算模型的包围体积
            const box = new THREE.Box3().setFromObject(model2);
            const size = box.getSize(new THREE.Vector3());
            const height = size.y; // 模型的高度
            console.log("男孩模型高度:", height);
            // 根据高度调整缩放比例
            const desiredHeight = 150; // 期望的高度
            const scale = desiredHeight / height;
            model2.scale.set(scale, scale, scale);
            // 设置模型的旋转和位置
            model2.rotation.x = Math.PI / 30;
            model2.rotation.y = Math.PI / 1.5;
            model2.position.set(130, 0, -250);
            // 将模型添加到场景中
            overlay.scene.add(model2);
            // 查找场景中的所有网格
            const modelMeshes_found = findMeshes(gltf.scene);
            // 将找到的网格添加到全局数组
            all_model_meshes.push(...modelMeshes_found);
            // 给模型添加点击事件
            model2.traverse((child) => {
                if (child.isMesh) {
                    child.cursor = 'pointer';
                    child.userData.isClickable = true;
                }
            });
            // 创建动画混合器并播放动画
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                const action = mixer.clipAction(gltf.animations[0]);
                mixer.timeScale = 0.5;
                action.setDuration(10).play();
                mixers.push(mixer);
                console.log("男孩模型动画已启动");
            }
            console.log("男孩模型加载成功");
            modelLoadStatus.boy = true;
            checkAnimationStart();
        } catch (error) {
            console.error('男孩模型加载失败:', error);
        }
    };
    loadModel2();
    overlay.onBeforeDraw = () => {
        if (mousePosition.x != 0 && mousePosition.y != 0) {
            var intersections = overlay.raycast(mousePosition, all_model_meshes, {
                recursive: false,
            });
            if (highlightedObject) {
                console.log("取消高亮显示");
                console.log("鼠标位置:", mousePosition);
            }
            if (intersections.length === 0) {
                highlightedObject = null;
                return;
            }
            highlightedObject = intersections[0].object;
            highlightedObject.material.color.setHex(HIGHLIGHT_COLOR);//暂停颜色变化
            if (highlightedObject.userData) {
                if (highlightedObject.userData.nation_id) {
                    console.log("检测到国家ID:", highlightedObject.userData.nation_id);
                    nation_id = highlightedObject.userData.nation_id;
                    currentModel = getPersonModelByNationId(nation_id);
                    mousePosition.x = 0;
                    mousePosition.y = 0;
                    showprofile3d(currentModel);
                }
            }
        }
    };
}


function checkAnimationStart() {
    if (animationStarted) return;

    if (modelLoadStatus.building &&
        modelLoadStatus.house &&
        modelLoadStatus.girl &&
        modelLoadStatus.boy) {

        animate(0);
        animationStarted = true;
        console.log("所有模型加载完成，启动动画");
    }
}
function loadModel(persondata) {
    let url = persondata["avatar_3d"];
    let pos = persondata["location"];
    const coordinates = {
        lat: parseFloat(pos[1]),
        lng: parseFloat(pos[0]),
    };

    // 创建新的加载器实例避免冲突
    const personalLoader = new THREE.GLTFLoader();

    // 封装加载过程
    const loadPersonalModel = async () => {
        try {
            // 使用重试机制加载模型
            const gltf = await loadModelWithRetry(personalLoader, url);
            model = gltf.scene;

            // 添加光照
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
            directionalLight.position.set(-1, -1, -1);

            // 设置模型元数据
            model.name = persondata["nation_id"];
            model.userData = persondata;

            // 计算模型尺寸并缩放
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const height = size.y;
            console.log(`个人模型高度 (${persondata.name}):`, height);

            const desiredHeight = 150;
            let scale = desiredHeight / height;
            console.log("缩放比例:", scale);

            model.scale.set(scale, scale, scale);
            model.rotation.x = Math.PI / 30;
            model.rotation.y = (Math.PI / 1.5);

            // 定位模型
            const position2 = overlay.latLngAltitudeToVector3(coordinates, model.position);
            console.log("模型位置:", position2);

            // 添加到场景
            overlay.scene.add(model);
            model_loaded_list[persondata["nation_id"]] = model;

            // 处理网格
            let modelMeshes = findMeshes(gltf.scene);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.cursor = 'pointer';
                    child.userData.isClickable = true;
                }
            });

            modelMeshes.forEach(mesh => {
                mesh.userData = persondata;
            });

            all_model_meshes.push(...modelMeshes);

            // 处理动画
            if (gltf.animations && gltf.animations.length > 0) {
                let mixer = new THREE.AnimationMixer(gltf.scene);
                const action = mixer.clipAction(gltf.animations[0]);
                mixer.timeScale = 1;
                const duration = gltf.animations[0].duration;
                action.setDuration(duration).play();
                mixers.push(mixer);
                console.log(`个人模型动画已启动 (${persondata.name})`);
            }

            console.log(`个人模型加载成功: ${persondata.name}`);
        } catch (error) {
            console.error(`个人模型加载失败 (${persondata.name}):`, error);
        }
    };

    // 执行加载
    loadPersonalModel();
}
function removeModel(nation_id) {
    if (model_loaded_list[nation_id]) {
        model = model_loaded_list[nation_id];
        overlay.scene.remove(model);
        delete model_loaded_list[nation_id];
        console.log(`已移除模型: ${nation_id}`);
    } else {
        console.warn(`尝试移除不存在的模型: ${nation_id}`);
    }
}
function getLastClickPoint() {
    return last_click_point;
}
function getDistance(start_point, end_point) {
    return google.maps.geometry.spherical.computeDistanceBetween(start_point, end_point);
}
function getCenter() {
    return map.getCenter();
}
