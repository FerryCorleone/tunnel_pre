class model extends model_Father {
	constructor(name, scale, position) {
		super(name, scale, position);
	}

	load(obj_url, mtl_url, keyName) {
		if (mtl_url != undefined) {
			super.load(obj_url, mtl_url, keyName);
		} else {
			var thisObject = this;
			new THREE.OBJLoader()
				.load(obj_url, function (result) {
					//thisObject.setScaleAndOffset(result)
					console.log(result);
					thisObject.three3dObject.totalModel = result;
					CloudPicture.getAllData(thisObject.three3dObject.totalModel);
					scene.add(thisObject.three3dObject.totalModel);
			});
		}
	}

	createMaterial_fenli(group) {
		var thisObject = this;
		var object = new THREE.Group();
		for (var i = 0; i < group.children.length; i++) {
			var newMesh = new THREE.Mesh(group.children[i].geometry,
				new THREE.MeshStandardMaterial({
					color: geoImformation[thisObject.meshName(group.children[i].name)].color,
					metalness: 0.1,
					roughness: 0.75,
				}));
			newMesh.name = this.meshName(group.children[i].name);
			object.add(newMesh);
		}
		object.name = "group_fenli";
		return object;
	}

	createMaterial_pouqie(group) {
		var thisObject = this;
		var object = new THREE.Group();

		//利用for循环分别设置和加载不同地层及颜色渲染
		var geometryGroup = [];
		var materialGroup = [];
		var poGroup = new THREE.Group();
		var stencilGroup = [];
		var planeMatGroup = [];
		var po = [];
		var clippedColorFront = [];


		for (var i = 0; i < group.children.length; i++) {
			geometryGroup[i] = group.children[i].geometry;
			//console.log(thisObject.meshName(group.children[i].name));
			//模型外表面材质
			materialGroup[i] = new THREE.MeshStandardMaterial({

				color: geoImformation[thisObject.meshName(group.children[i].name)].color,
				metalness: 0.1,
				roughness: 0.75,
				clippingPlanes: planes,
				clipShadows: true,
				shadowSide: THREE.DoubleSide,

			});

			// 设置XYZ三个方向剖切面的渲染
			planeObjects[i] = [];
			stencilGroup[i] = [];

			var planeGeom = new THREE.PlaneBufferGeometry(10000, 10000);
			for (let j = 0; j < 3; j++) {

				var plane = planes[j];

				stencilGroup[i][j] = createPlaneStencilGroup(geometryGroup[i], plane, j + 3 * i + 1);

				// 分地层设置剖切面材质

				planeMatGroup[i] =
					new THREE.MeshStandardMaterial({

						color: geoImformation[thisObject.meshName(group.children[i].name)].color,
						metalness: 0.1,
						roughness: 0.75,
						// transparent:true,
						// opacity:1,
						// visible: false,
						clippingPlanes: planes.filter(p => p !== plane),

						stencilWrite: true,
						stencilRef: 0,
						stencilFunc: THREE.NotEqualStencilFunc,
						stencilFail: THREE.ZeroStencilOp,
						stencilZFail: THREE.ZeroStencilOp,
						stencilZPass: THREE.ZeroStencilOp,

					});

				po[i] = new THREE.Mesh(planeGeom, planeMatGroup[i]);
				po[i].onAfterRender = function (renderer) {
					renderer.clearStencil();
				};
				po[i].renderOrder = j + 3 * i + 1.1; //关键步骤：渲染顺序，一定要前一个geometry的三个剖面都渲染完毕再开始第二个geometry的剖面渲染
				object.add(stencilGroup[i][j]);
				poGroup.add(po[i]);
				planeObjects[i].push(po[i]);
				scene.add(poGroup);


			} //结束j循环

			// 外表面网格模型
			clippedColorFront[i] = new THREE.Mesh(geometryGroup[i], materialGroup[i]);
			clippedColorFront[i].castShadow = true;
			clippedColorFront[i].renderOrder = 100;
			clippedColorFront[i].name = thisObject.meshName(group.children[i].name);
			object.add(clippedColorFront[i]);


		} // 结束i循环

		object.name = "group_pouqie";
		return object;
	}

}