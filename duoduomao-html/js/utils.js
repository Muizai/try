var utils = (function (){
	//使用惰性思想（JS高阶编程技巧之一）来封装我的常用的方法库：第一次在给utils赋值的时候，我们就已经把兼容处理好了，把最后的结果存放在flag变量中使用惰性思想（JS高阶编程技巧之一）来封装我的常用的方法库：第一次在给utils赋值的时候，我们就已经把兼容处理好了，把最后的结果存放在flag变量中，以后在每一个方法中，只要是IE6~8不兼容的，我们不需要重新检测，只要flag的值，节省性能
	var flag="getComputedStyle" in window;      
	//flag这个变量不销毁，存储的是判断当前的浏览器是否兼容getComputedStyle，
	//如果flag是true的话就是兼容，兼容的话是标准浏览器，但是如果flag为false，说明当前的浏览器为IE6~8

	//将类数组转化为数组
	function listToArray(likeArray){
		var ary=[];
		if(flag){
			return Array.prototype.slice.call(likeArray);
		}
		for(var i=0;i<likeArray.length;i++){
			ary[ary.length]=likeArray[i];
		};
		// try{
		// 	ary=Array.prototype.slice.call(likeArray)
		// }catch(e){
		// 	for(var i=0;i<likeArray.length;i++){
		// 		ary[ary.length]=likeArray[i];
		// 	}
		// }
		return ary;
	};
	//将JSON格式的字符串转化为JSON格式的对象
	function formatJSON(jsonStr){
		//var obj={};
		//第一种方法
		// try{
		// 	obj=JSON.parse(str);
		// }catch(e){
		// 	obj=eval("( "+ str +" )" );
		// }
		// return obj;

		//第二种方法
		//return "JSON" in window ? JSON.parse(jsonStr) : eval("( "+jsonStr+" )");

		//第三种方法
		if(flag){
			return JSON.parse(jsonStr);
		}
			return eval("( "+jsonStr+" )");
	};
	//获取CSS样式属性值
	function getCss(curEle,attr){
		var val=null,reg=null;
		if(flag){
			val=window.getComputedStyle(curEle,null)[attr];
		}else{
			if(attr === "opacity"){
				val=curEle.currentStyle["filter"];
				reg=/^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
				val=reg.test(val) ? reg.exec(val)[1]/100 :1 ;
			}else{
				val=curEle.currentStyle[attr];
			}

		}
		reg=/^-?\d+(\.\d+)?(px|pt|rem|em)?$/i;
		return reg.test(val) ? parseFloat(val) : val;
	};
	//获取页面任意元素距离body的左偏移和上偏移
	function offset(curEle){
		var totalLeft=null,totalTop=null,par=curEle.offsetParent;
		totalLeft+=curEle.offsetLeft;
		totalTop+=curEle.offsetTop;
		while(par){
			if(navigator.userAgent.indexOf("MSIE 8.0")===-1){
				//在标准IE8浏览器中，使用offsetLeft/offsetTop其实是把父级参照物的边框已经算在内了，不需要再自己单独加，非IE8浏览器才需要
				totalLeft+=par.clientLeft;
				totalTop+=par.clientTop;
				
			}
			totalLeft+=par.offsetLeft;
			totalTop+=par.offsetTop;
			par=par.offsetParent;

		}
		return {left:totalLeft,top:totalTop};
	};
	//获取或设置关于浏览器的盒子模型的信息
	function win(attr,value){
		if(typeof value==="undefined"){
			return document.documentElement[attr]||document.body[attr];
		}else{
			document.documentElement[attr]=value;
			document.body[attr]=value;
		}
	};
	//获取某一个容器中的指定标签名的元素子节点,如果传递了tagName，则进行二次筛选，如果不传递则只获取子元素不筛选
	function children(curEle,tagName){
		var nodeList=curEle.childNodes;
		var ary=[];
		if(!flag){//flag 为假时就是IE6~8  非就是真
			///MSIE (6|7|8)/i.test(navigator.userAgent 等同于 !flag
			for(var i=0;i<nodeList.length;i++){
				var curNode=nodeList[i];
				if(curNode.nodeType === 1){
					ary[ary.length]=curNode;
				}
			}
			nodeList=null;
		}else{//标准浏览器直接用内置的children属性，但是获取到的是一个元素集合（类数组），为了和IE6~8下保持一致，借用数组原型上的slice，实现把类数组转化为数组
			ary=Array.prototype.slice.call(curEle.children);
			//ary=this.listToArray(curEle.children);
		}

		//二次筛选
		if(typeof tagName==="string"){
			for(var k=0;k<ary.length;k++){
				var curEleNode=ary[k];
				if (curEleNode.nodeName.toLowerCase()!==tagName.toLowerCase()) {
					//如果不是想要的标签
					ary.splice(k,1);
					k--;
				}
			}
		}
		return ary;
	};
	//prev:获取上一个哥哥元素节点
	function prev(curEle){
		if(flag){
			return curEle.previousElementSibling;
		}
		//首先获取当前元素的上一个哥哥节点，判断是否为元素节点，不是的话基于当前的继续找上面的节点，一直到找到哥哥元素节点位置，如果没有哥哥元素节点，返回null即可
		var pre=curEle.previousSibling;
		while(pre && pre.nodeType !==1){
			pre=pre.previousSibling;
		}
		return pre;
	};
	//next:获取下一个弟弟元素节点
	function next(curEle){
		if(flag){
			return curEle.nextElementSibling;
		}
		//首先获取当前元素的下一个弟弟节点，判断是否为元素节点，不是的话基于当前的继续找下面的节点，一直到找到弟弟元素节点位置，如果没有弟弟元素节点，返回null即可
		var next=curEle.nextSibling;
		while(next && next.nodeType !==1){
			next=next.nextSibling;
		}
		return next;
	};
	//prevAll：获取所有的哥哥元素节点
	function prevAll(curEle){
		var ary=[];
		var pre=this.prev(curEle);
		while(pre){
			ary.unshift(pre);
			pre=this.prev(pre);
		}
		return ary;
	};
	//nextAll：获取所有的弟弟元素节点
	function nextAll(curEle){
		var ary=[];
		var next=this.next(curEle);
		while(next){
			ary.push(next);
			next=this.next(next);
		}
		return ary;
	};
	//sibling：获取相邻的两个元素节点
	function sibling(curEle){
		var pre=this.prev(curEle);
		var next=this.next(curEle);
		var ary=[];
		pre ? ary.push(pre) : null;
		next ? ary.push(next) : null;
		return ary;
	};
	//siblings：获取所有的兄弟元素节点
	function siblings(curEle){


		return this.prevAll(curEle).concat(this.nextAll(curEle));
	};
	//index：获取当前元素索引
	function index(curEle){
		//有几个哥哥，索引就是几，比如它的索引是2，就应该是有两个哥哥，因为索引从0开始
		return this.prevAll(curEle).length;
	};
	//firstChild：获取curEle下面的第一个元素子节点
	function firstChild(curEle){
		var chs=this.children(curEle);
		return chs.length > 0 ? chs[0] : null;
	};
	//lastChild：获取curEle下面的最后一个元素子节点
	function lastChild(curEle){
		var chs=this.children(curEle);
		return chs.length > 0 ? chs[chs.length-1] : null;
	};
	//append：向指定容器的末尾追加元素 --> append方法内置有，也可以直接用
	function append(newEle,container){


		container.appenChild(newEle)
	};
	//prepend：向指定容器的开头追加元素 -->把新的元素添加到容器中第一个子元素节点的前面，如果一个子元素节点都没有，则添加到容器末尾即可，也是第一个
	function prepend(newEle,container){
		var first=this.firstChild(container);
		if(first){
			container.insertBefore(newEle,first);
			return;
		}
		container.appenChild(newEle)
	};
	//insertBefore：向容器中指定元素的前面追加元素  -->insertBefore方法内置有，也可以直接用
	//insertBefore的用法：list.insertBefore(newEle,oldEle)
	//在list这个容器中，找到oldEle，把newEle添加到oldEle的前面
	function insertBefore(newEle,oldEle){

		oldEle.parentNode.insertBefore(newEle,oldEle);
	};
	//insertAfter：向容器中指定元素的后面追加元素  -->相当于追加到oldEle的弟弟的前面，如果oldEle的弟弟不存在，也就是当前元素已经是最后一个了，则把元素放在最末尾即可
	function insertAfter(newEle,oldEle){
		var next=this.next(oldEle);
		if(next){
			oldEle.parentNode.insertBefore(newEle,next);
			return;
		}
		oldEle.parentNode.appenChild(newEle);
	};
	//hasClass：验证当前元素是否包含className这个样式名
	function hasClass(curEle,className){
		var reg=new RegExp("(^| +)"+className+"( +|$)");
		return reg.test(curEle.className);
	};
	//addClass：给元素增加样式类名
	function addClass(curEle,className){
		className.replace(/(^ +| +$)/g,"");//去掉字符串的首尾空格
		var ary=className.split(/ +/g);
		for(var i=0;i<ary.length;i++){
			var curName=ary[i];
			var reg=new RegExp("(^| +)"+curName+"( +|$)");
			var judge=reg.test(curEle.className);
			if(!judge){
				curEle.className+=" " + curName;
			}
		}
	};
	//removeClass：移除元素的样式类名
	function removeClass(curEle,className){
		className.replace(/(^ +| +$)/g,"");//去掉字符串的首尾空格
		var ary=className.split(/ +/g);
		for(var i=0;i<ary.length;i++){
			var curName=ary[i];
			var reg=new RegExp("(^| +)"+curName+"( +|$)","g");
			var judge=reg.test(curEle.className);
			if(judge){
				curEle.className=curEle.className.replace(reg," ");
			}
		}
	};
	//getElementsByClassName：通过ClassName获取元素
	function getElementsByClassName(className,context){
		var final_ary=[];
		context = context || document ;  //有传入context则是context，没有则是document
		if(flag){
			//标准浏览器下，context.getElementsByClassName(className)得到的是一个类数组，转化为数组
			return Array.prototype.slice.call(context.getElementsByClassName(className));
		}
		var ary=className.replace(/(^ +| +$)/g,"").split(/ +/g);  //去掉首尾空格，再把字符串转化为数组
		var nodeList=context.getElementsByTagName("*");  //获取context下的所有标签元素
		for(var i=0;i<nodeList.length;i++){ //循环获取到的元素
			var curNode=nodeList[i];
			var isExist=true;
			for(var k=0;k<ary.length;k++){  //循环要查找的ClassName
				var curName=ary[k];
				var reg=new RegExp("(^| +)"+curName+"( +|$)");
				if(!reg.test(curNode.className)){
					isExist=false;
					break;
				}
			}
			if(isExist){
				final_ary.push(curNode);
			}
		}
		return final_ary;
	}
	//getCss：获取元素的属性值
	function getCss(curEle,attr){
		var val=null,reg=null;
		if("getComputedStyle" in window){
			val=window.getComputedStyle(curEle,null)[attr];
		}else{
			if(attr==="opacity"){
				val=curEle.currentStyle["filter"]; //"alpha(opacaty=10)" -->把获取到的结果进行解析，获取里面的数字，让数字除以100才和标准的浏览器保持一致（10/100=0.1）
				reg=/^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;//?:-->只匹配不捕获
				val=reg.test(val) ? reg.exec(val)[1]/100 : 1;
			}else{
				val=curEle.currentStyle[attr];
			}
		}
		reg=/^-?\d+(\.\d+)?(px|pt|rem|em)?$/i;
		return reg.test(val) ? parseFloat(val) : val;
	}
	//setCss：设置元素的属性值
	function setCss(curEle,attr,value){
		//设置float值处理兼容
		if(attr==="float"){
			curEle["style"]["cssFloat"] = value;
			curEle["style"]["styleFloat"] = value;
			return;
		}
		//设置透明度处理兼容
		if(attr==="opacity"){
			curEle["style"]["opacity"] = value;
			curEle["style"]["filter"] = "alpha(opacity=" +value * 100 + ")"
			////"alpha(opacaty=10)"
			return;
		}
		//对于某些样式属性，如果传递进来的值没有加单位，自动给它补上单位
		var reg=/^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
		if(reg.test(attr)){
			if(!isNaN(value)){
				value += "px" ;
			}
		}
		curEle["style"][attr] = value ;
	}
	//setGroupCss：批量设置元素的属性值
	function setGroupCss(curEle,obj){
		//通过检测obj的数据类型，如果不是一个对象，则不能进行批量设置
		obj = obj || 0; //如果没有传递obj，则设置为0，避免是null或undefined，因为null或undefined没有toString方法
		if(obj.toString() !== "[object Object]"){
			//obj.toString() --> Object.prototype.toString.call(obj)
			return;
		}
		//遍历对象中的每一项，调取setCss方法一个个进行设置
		for(var key in obj){
			if(obj.hasOwnProperty(key)){
				if(key==="float"){
					curEle["style"]["cssFloat"] = obj[key];
					curEle["style"]["styleFloat"] = obj[key];
					continue;
				}
				if(key==="opacity"){
					curEle["style"]["opacity"] = obj[key];
					curEle["style"]["filter"] = "alpha(opacity=" + obj[key] + ")";
					continue;
				}
				var reg=/^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
				if(reg.test(key)){
					if(!isNaN(obj[key])){
						obj[key] += "px" ;
					}
				}
				curEle["style"][key] = obj[key];
			}
		}
	}
	//css：一次性获取、设置、批量设置元素的属性值
	function css(curEle){
		var argTwo = arguments[1];
		if(typeof argTwo === "string"){
			var argThree = arguments[2];
			if(argThree === undefined){
				//!argThree argThree === undefined--> 这样写argThree有可能是0，或者null，会导致传入的0或者null无效
				return this.getCss.apply(this,arguments);
			}
			return this.setCss.apply(this,arguments);
		}
		argTwo = argTwo || 0;
		return this.setGroupCss.apply(this,arguments);
	}

	// myAddEvent:给元素绑定方法
	function myAddEvent(cur,ev,fn){
		if(flag){
			cur.addEventListener(ev,fn,false);
		}else{
			cur.attachEvent("on"+ev,fn);
		}

	}








	//把外界需要使用的方法暴露给utils
	return {
		//将类数组转化为数组
		listToArray:listToArray,
		//将JSON格式的字符串转化为JSON格式的对象
		formatJSON:formatJSON,
		//获取CSS样式属性值
		getCss:getCss,
		//获取页面任意元素距离body的左偏移和上偏移
		offset:offset,
		//获取或设置关于浏览器的盒子模型的信息
		win:win,
		//获取某一个容器中的指定标签名的元素子节点,如果传递了tagName，则进行二次筛选，如果不传递则只获取子元素不筛选
		children:children,
		//prev:获取上一个哥哥元素节点
		prev:prev,
		//next:获取下一个弟弟元素节点
		next:next,
		//prevAll:获取所有哥哥元素节点
		prevAll:prevAll,
		//nextAll：获取所有的弟弟元素节点
		nextAll:nextAll,
		//sibling：获取相邻的两个元素节点
		sibling:sibling,
		//siblings：获取所有的兄弟元素节点
		siblings:siblings,
		//index:获取当前元素的索引
		index:index,
		//firstChild：获取第一个元素子节点
		firstChild:firstChild,
		//lastChild：获取最后一个元素子节点
		lastChild:lastChild,
		//append：向指定容器的末尾追加元素
		append:append,
		//prepend：向指定容器的开头追加元素
		prepend:prepend,
		//insertBefore：向容器中指定元素的前面追加元素
		insertBefore:insertBefore,
		//insertAfter：向容器中指定元素的后面追加元素
		insertAfter:insertAfter,
		//hasClass：验证当前元素是否包含className这个样式名
		hasClass:hasClass,
		//addClass：给元素增加样式类名
		addClass:addClass,
		//removeClass：移除元素的样式类名
		removeClass:removeClass,
		//getElementsByClassName：通过ClassName获取元素
		getElementsByClassName:getElementsByClassName,
		//getCss：获取元素的属性值
		getCss:getCss,
		//setCss：设置元素的属性值
		setCss:setCss,
		//setGroupCss：批量设置元素的属性值
		setGroupCss:setGroupCss,
		//css：集合获取、设置、批量设置元素的属性值
		css:css,
		// myAddEvent:给元素绑定方法
		myAddEvent:myAddEvent
	}
	

	
})();