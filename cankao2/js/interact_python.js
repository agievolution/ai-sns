//interact with python

var api_object = null;

document.addEventListener("DOMContentLoaded", function () {
    new QWebChannel(qt.webChannelTransport, function (channel) {
        api_object = channel.objects.message_handler;
        api_object.on_chat_message.connect(show_talk_message);
        api_object.on_show_status.connect(show_status_on_map);
        api_object.on_show_alert.connect(showAlert);
        api_object.on_command_message.connect(handle_command);
        loadMapSetting();
        loadMoreItems(true);
    });
});

var show_talk_message = function (from, to, msg) {
    // return false;
    console.log(from);
    console.log(to);
    from_point = getPersonPointByAccount(from);
    person_data = getPersonDataByAccount(from);
    if (map_type == "google") {
        // return true;
        send_chat_msg(from_point.lng(), from_point.lat(), msg, person_data["nick_name"]);
    } else {
        send_chat_msg(from_point.lng, from_point.lat, msg, person_data["nick_name"]);
    }
}

var show_status_on_map = function (status) {
    aimodel_status.show(status);
}

var handle_command = function (command, param_1, param_2) {

    if (command == "talk_to_it") {
        if (map_type == "google") {
            let marker = getMarkerByNationId(param_1);
            hiddenMarkers[param_1] = marker;
        } else {
            div = document.getElementById(param_1);
            hiddenPoints[param_1] = div;
        }
        talk_to_it(param_1, param_2)
    } else if (command == "start_talk_to_it") {
        if (map_type == "google") {
            let marker = getMarkerByNationId(param_1);
            hiddenMarkers[param_1] = marker;
        } else {
            div = document.getElementById(param_1);
            hiddenPoints[param_1] = div;
        }
        start_talk_to_it(param_1, param_2)
    } else if (command == "move_to_a_place") {
        if (map_type == "google") {
            setPersonModelPointByNationId(nation_id_me, new google.maps.LatLng(parseFloat(param_2), parseFloat(param_1)));
        } else {
            alert("moving");
            alert(param_2);
            setPersonModelPointByNationId(nation_id_me, new BMapGL.Point(parseFloat(param_1), parseFloat(param_2)));
        }
        setPersonPointByNationId(nation_id_me, parseFloat(param_1), parseFloat(param_2));
        findHim();
    } else if (command == "route_move_action") {
        route_move_action_from_python();
    } else if (command == "show_information") {
        addMessageToBoard(param_1);
    } else if (command == "show_information_chat") {
        appendMessageToBoardChat(param_1);
    } else if (command == "load_information") {
        appendMessageToBoard(param_1);
    } else if (command == "load_information_chat") {
        appendMessageToBoardChat(param_1);
    } else if (command == "load_map_setting") {
        handle_map_setting_loaded(param_1);
    } else if (command == "clear_chat_history") {
        clear_chat_history();
    } else if (command == "clear_chat_list") {
        clear_chat_list();
    } else if (command == "check_place") {
        let lng = parseFloat(param_2.split('_')[0]);
        let lat = parseFloat(param_2.split('_')[1]);
        check_place(param_1, lng, lat)
    }else if (command == "python_setting_changed") {
        if(param_1=="nick_name"){
            alert(param_2);
            person_data_me.nick_name = param_2;
        }else if(param_1=="profile"){
            alert(param_2);
            person_data_me.profile = param_2;
        }
    }

}

function loadMapSetting() {
    api_object.load_map_setting();
}

function handle_map_setting_loaded(setting_json) {
    const settings = JSON.parse(setting_json);

    // 对这三个值进行容错处理，如果json.parse正确则使用parse后的值赋值，否则{}
    try {
        settings.current_position = settings.current_position ? JSON.parse(settings.current_position) : {};
    } catch (e) {
        settings.current_position = {};
    }

    try {
        settings.home_position = settings.home_position ? JSON.parse(settings.home_position) : {};
    } catch (e) {
        settings.home_position = {};
    }

    try {
        settings.route_current_position = settings.route_current_position ? JSON.parse(settings.route_current_position) : {};
    } catch (e) {
        settings.route_current_position = {};
    }

    const {
        avatar3d,
        nationid,
        account,
        nick_name,
        avatar,
        profile,
        sns_url,
        status,
        map_type,
        current_position,
        home_position: setting_home_position,
        route_current_position,
        route,
        route_start,
        route_end,
        route_status
    } = settings;

    // 检查所有必要字段是否存在，如果不存在则提醒用户
    if (!nationid || nationid === "") {
        showAlert("缺少 nationid 配置，请检查设置", true);
        return;
    }

    if (!account || account === "") {
        showAlert("缺少 account 配置，请检查设置", true);
        return;
    }

    if (!current_position || !current_position.lng || !current_position.lat) {
        showAlert("缺少当前位置配置，请检查设置", true);
        return;
    }

    if (!nick_name || nick_name === "") {
        showAlert("缺少昵称配置，请检查设置", true);
        return;
    }

    if (!avatar || avatar === "") {
        showAlert("缺少头像配置，请检查设置", true);
        return;
    }

    if (!avatar3d || avatar3d === "") {
        showAlert("缺少3D头像配置，请检查设置", true);
        return;
    }

    if (!profile || profile === "") {
        showAlert("缺少个人资料配置，请检查设置", true);
        return;
    }

    if (map_type === undefined || map_type === null) {
        showAlert("缺少地图类型配置，请检查设置", true);
        return;
    }

    // setting_home_position 可以为空，但如果提供了就需要有lng和lat
    if (setting_home_position &&
        (setting_home_position.lng === undefined || setting_home_position.lat === undefined)) {
        showAlert("家庭位置配置不完整，请检查设置", true);
        return;
    }

    // route_current_position 可以为空，但如果提供了就需要有lng和lat




    // route_start 和 route_end 可以为空，但如果提供了route_status为playing，它们就必须存在
    if (route_status === "playing" && (!route_start || route_start === "" || !route_end || route_end === "")) {
        showAlert("路线状态为指定路线，但缺少起点或终点配置，请检查设置", true);
        return;
    }



    nation_id_me = nationid;

    // 显示加载的配置信息到信息列表中




    if (route_current_position && Object.keys(route_current_position).length > 0) {
        addMessageToBoard("路线当前位置: " + route_current_position.lng + ", " + route_current_position.lat);
    }

    if (route && route !== "") {
        addMessageToBoard("路线距离: " + route);
    }

    if (route_end && route_end !== "") {
        addMessageToBoard("路线终点: " + route_end);
    }

    if (route_start && route_start !== "") {
        addMessageToBoard("路线起点: " + route_start);
    }


    if (route_status && route_status !== "") {
        // 根据route_status值显示相应的中文描述
        var display_route_status;
        if (route_status == "playing") {
            display_route_status = "指定路线";
        } else if (route_status == "stopped") {
            display_route_status = "自由路线";
        } else {
            display_route_status = "路线类型不明";
        }
        addMessageToBoard("路线状态: " + display_route_status);
    }



    if (setting_home_position && Object.keys(setting_home_position).length > 0) {
        addMessageToBoard("家庭位置: " + setting_home_position.lng + ", " + setting_home_position.lat);
    }else {
        addMessageToBoard("家庭位置: 未设置");
    }

    addMessageToBoard("当前位置: " + current_position.lng + ", " + current_position.lat);
    // 修改地图类型显示逻辑：0表示google，其他值表示baidu
    var display_map_type = (map_type == "0") ? "google" : "baidu";
    addMessageToBoard("地图类型: " + display_map_type);
     addMessageToBoard("个人资料: " + profile);
     addMessageToBoard("3D头像: " + avatar3d);
     addMessageToBoard("头像: " + avatar);
    addMessageToBoard("昵称: " + nick_name);
    addMessageToBoard("XMPP账户: " + account);
    addMessageToBoard("用户ID: " + nationid);
    addMessageToBoard("配置加载成功:");

    // 设置全局变量 current_position，供 map_common.js 使用
    window.current_position = current_position || {};

    // 根据地图类型调用相应的初始化函数
    // map_type == "0" 表示 Google 地图，否则是百度地图
    if (map_type == "0") {
        // Google 地图：如果地图已经初始化，重新设置中心点
        if (typeof map !== 'undefined' && map !== null) {
            const googleCenter = new google.maps.LatLng(current_position.lat, current_position.lng);
            map.setCenter(googleCenter);
            console.log("Google地图中心点已更新:", current_position);
        }
    } else {
        // 百度地图：调用初始化函数
        if (typeof initializeMapCenter === 'function') {
            initializeMapCenter();
        }
    }

    // 调整这两个变量，如果有值就设置，如果没有值，就设置为{}
    home_position = (setting_home_position && typeof setting_home_position.lng !== 'undefined') ?
        {
            lng: setting_home_position.lng,
            lat: setting_home_position.lat,
            altitude: setting_home_position.altitude
        } : {};

    init_route_current_position = (route_current_position && typeof route_current_position.lng !== 'undefined') ?
        {
            lng: route_current_position.lng,
            lat: route_current_position.lat
        } : {};

    if (route) {
        init_route_distance = parseFloat(route);
        // 将route的值赋予全局变量currentDistance
        if (typeof window !== 'undefined') {
            window.currentDistance = parseFloat(route);
        } else {
            currentDistance = parseFloat(route);
        }
    }

    // 初始化route_status变量

    if (typeof route_status !== 'undefined' && route_status !== null) {
        window.route_status = route_status;
        initRouteDisplay();

        // 如果route_status为playing，请将route_start和route_end的值赋予googlemap3d.html和map.html上的id为start和id为end的input，然后运行planRoute函数
        if (route_status === "playing") {
            // 延迟执行以确保DOM已加载完成
            setTimeout(function () {
                // 设置起始点和终点到对应的输入框
                const startInput = document.getElementById("start");
                const endInput = document.getElementById("end");

                if (startInput && typeof route_start !== 'undefined' && route_start !== null) {
                    startInput.value = route_start;
                }

                if (endInput && typeof route_end !== 'undefined' && route_end !== null) {
                    endInput.value = route_end;
                }

                // 添加保护措施防止planRoute不停运行
                // 确保planRoute函数存在且未在运行中
                if (typeof planRoute === 'function' && !window.planRouteRunning) {
                    window.planRouteRunning = true;
                    try {
                        // 传入false表示这是自动调用，不是用户主动发起
                        planRoute(false);
                        if (map_type == 1) {

                            setTimeout(function () {
                                continueTrack();

                            }, 15000);
                        }


                        setTimeout(function () {
                            pauseTrack();
                        }, 15500);
                        // continueTrack();
                        // pauseTrack();
                    } catch (e) {
                        console.error("Error executing planRoute:", e);
                    } finally {
                        // 确保标志位被重置，但延迟一点时间以防止频繁调用
                        setTimeout(function () {
                            window.planRouteRunning = true;
                        }, 1000);
                    }
                }
            }, 100);
        }
    }


    person_data_me = {
        nation_id: nationid, // 使用国家 ID
        account:account, // 使用账户
        location: [current_position.lng, current_position.lat], // 位置数组，包含经纬度
        nick_name:nick_name, // 昵称
        avatar:avatar, // 头像 URL
        avatar_3d: avatar3d, // 3D 头像
        profile:profile, // 个人资料
        sns_url: sns_url,
        status: status //
    };

    loadModel(person_data_me);

    load_persons_data_and_show();
// findHim();
//     setTimeout(() => {
// findHim();
// }, 5000);
//         setTimeout(() => {
// findHim();
// }, 8000);

}

function update_map_setting(field_name, field_value) {
    api_object.update_map_setting(field_name, field_value);
}

function loadMoreItems(init_flag) {
    if (init_flag) {
        api_object.info_load_more("-1");
    } else {
        api_object.info_load_more(info_window_type);
    }
}

function loadMoreItemsChat() {
    api_object.info_load_more_chat();
}

function open_url(url) {
    api_object.open_url(url);
}

function userInfo() {
    api_object.user_info();
}

function advSetting() {
    api_object.adv_setting();
}

function Maximize() {
    // 控制最大化相关的UI元素
    document.getElementById("maximize").style.display = "none";
    document.getElementById("minimize").style.display = "flex";

    // 隐藏顶部栏和右侧菜单，参考top-bar-toggle和menu-toggle被点击的效果
    document.querySelector('.top-bar').classList.add('collapsed');
    document.querySelector('.right-menu').classList.add('collapsed');

    // 切换图标方向
    const topBarIcon = document.querySelector('.top-bar-toggle i');
    topBarIcon.classList.remove('fa-angle-double-up');
    topBarIcon.classList.add('fa-angle-double-down');

    const rightMenuIcon = document.querySelector('.right-menu .menu-toggle i');
    rightMenuIcon.classList.remove('fa-angle-double-right');
    rightMenuIcon.classList.add('fa-angle-double-left');

    api_object.maximize();
}

function Minimize() {
    // 控制最小化相关的UI元素
    document.getElementById("minimize").style.display = "none";
    document.getElementById("maximize").style.display = "flex";

    // 显示顶部栏和右侧菜单
    document.querySelector('.top-bar').classList.remove('collapsed');
    document.querySelector('.right-menu').classList.remove('collapsed');

    // 切换图标方向
    const topBarIcon = document.querySelector('.top-bar-toggle i');
    topBarIcon.classList.remove('fa-angle-double-down');
    topBarIcon.classList.add('fa-angle-double-up');

    const rightMenuIcon = document.querySelector('.right-menu .menu-toggle i');
    rightMenuIcon.classList.remove('fa-angle-double-left');
    rightMenuIcon.classList.add('fa-angle-double-right');

    api_object.minimize();
}

function userSetting() {
    api_object.user_setting();
}

function jobSetting() {
    api_object.job_setting();
}

function showGameTarget() {
    api_object.show_game_target();
}

function mapcfgSetting() {
    api_object.mapcfg_setting();
}

function open_sns_profile(url) {
    api_object.open_sns_profile(url);
}

function close_sns_profile() {
    api_object.close_sns_profile();
}

function send_im(from, to, msg) {
    api_object.send_im(from, to, msg);
}
