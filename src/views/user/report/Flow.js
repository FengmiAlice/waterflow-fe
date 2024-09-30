import React, { useState, useEffect, useRef,useCallback } from 'react';
import { Graph, Shape, FunctionExt, Addon} from '@antv/x6';
import { ZoomInOutlined, ZoomOutOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { Toolbar } from '@antv/x6-react-components';
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';
import { DatePicker, Form, Input, Select,message } from 'antd';
import { getGraphDetail, getNodeList, graphSubmit, getDynamicSelectValue } from '../../../api/report';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
const Item = Toolbar.Item;
const Group = Toolbar.Group;
const { Option } = Select;
// const { RangePicker } = DatePicker; 

export default function Flow() {
    const navigate = useNavigate();
    const [initFlag, setInitFlag] = useState(false);
    const drawGraph = useRef(null);
    const [selectNode,setSelectNode] = useState(null);//存储选中节点
    const [nodeProperties, setNodeProperties] = useState(null);  // 更新节点的属性
    const [selectedArray,setSelectedArray]=useState([]);//节点属性下拉框列表
    const [flowId] = useState(new URLSearchParams(window.location.search).get('id'));//流程图详情id
    const [flowName] = useState(new URLSearchParams(window.location.search).get('name'));//流程图名称
    // const [dynamicSelectRel,setDynamicSelectRel]=useState([]);//获取动态下拉框数据的标识
    const [nodeList,setNodeList]=useState([]);//左侧可拖拽的节点列表

    useEffect(() => {
   
        if (!initFlag) {
            setInitFlag(true);
            // console.log('初始渲染111')
            let searchParams = new URLSearchParams(window.location.search);
            // console.log('路由传递过来的参数---',searchParams)
            if (searchParams) {
                let id = searchParams.get('id'); //获取流程图详情id
                // console.log('流程图详情id---',id)
                getFlowInitDetail(id);
                getLeftNodeLists();
            }
            const container = document.getElementById('container');
             // 创建一个graph对象并实例化
            const graph = new Graph({
                container: container,//画布载体
                width: 800,//画布宽度
                height: 600,//画布高度
                history: true,// 开启历史记录
                // 背景网格设置
                grid: {
                    size: 10,//网格大小
                    visible: true,//网格是否可见
                },
                 // 对齐线设置
                snapline:{
                    enabled: true,
                },
                autoResize:true,//自动调整
                //启用框选
                selecting: true,
                // 配置连线规则
                connecting: {
                    snap: true,//自动吸附
                    allowPort:true,//允许边链接到链接桩
                    allowEdge:true,//允许边链接到另一个边
                    createEdge() {
                        //新的连接线
                        return new Shape.Edge({
                             tools: [
                                {
                                    name: 'button-remove',  // 工具名称
                                    args: {
                                        onClick({ e, cell }){
                                            // console.log('删除线段---', e, cell)
                                            e.stopPropagation(); 
                                            graph.removeCell(cell);
                                         
                                        }
                                    }, 
                                },
                            ],
                        })
                    }
                }
            })
              // 将graph实例化对象赋值给drawGraph
            drawGraph.current = graph;
             // 鼠标进入节点/线
            graph.on("cell:mouseenter",FunctionExt.debounce( ({cell}) => {
                    if(cell.isNode()){
                      const ports = container.querySelectorAll(".x6-port-body");
                      showPorts(ports, true);//显示连接桩
                    }
                }),
                500
            );
            // 鼠标离开节点/线
            graph.on("cell:mouseleave", ({cell}) => {
                if(cell.isNode()){
                    const ports = container.querySelectorAll(".x6-port-body");
                    showPorts(ports, false);//隐藏连接桩
                }
            });
            graph.on('node:click', ({cell,e}) => {
                 e.stopPropagation()
                // 显示或更新节点属性  
                setSelectNode(cell)
              
            })
        } else {
            // console.log('不是初始渲染222')
        }
    }, [initFlag, drawGraph]);
    // 初始化流程图数据
    function getFlowInitDetail(id) {
        getGraphDetail({ id: id }).then(res => { 
            if (res.data.success === true) { 
                let  data  = res.data.obj;
                // console.log('初始化图表详情数据---',data)      
                // 取返回接口的节点、边的uiProperties来渲染流程图
                let initNodes =data.workflowSchema.nodes.map((item) => {
                    return item.uiProperties
                })
                let initEdges=data.workflowSchema.edges.map((item) => {
                    return item.uiProperties
                })
                let graphData = {
                    nodes:initNodes,
                    edges:initEdges,
                }
                drawGraph.current.fromJSON(graphData)
            }
       })
    }
    // 获取左侧可拖拽节点列表
     function getLeftNodeLists() {
        getNodeList().then((res)=>{
            if (res.data.success === true) {
                setNodeList(res.data.obj.list)
            }
        })
    }
    // 连接桩隐藏处理
    function showPorts(ports, show) {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
        }
    }
    // 拖动左侧菜单后按下鼠标触发事件
    function dragNodeDown(e,item) {
        // console.log('鼠标按下---',e,item)
        startDragToGraph(drawGraph.current, item, e);
        getDynamicSelectedList(item); // 获取动态下拉框的值
    }
      // 动态获取节点属性下拉框可选值列表数据
    function getDynamicSelectedList(node) {
        // console.log('鼠标按下点击的节点---',node)
        let properties = node.properties;
        // properties.forEach(item => { 
        //     if (item.valueSchema.type === 'list' && item.valueSchema.source === 'rel') {
        //         let dynamicSelectRel = item.valueSchema.rel; // 获取到动态下拉框的rel
        //         if (dynamicSelectRel) {
        //             let params = {
        //                 rel: dynamicSelectRel
        //             }
        //             getDynamicSelectValue(params).then((res) => {
        //                 if (res.data.success === true) {
        //                     setSelectedArray(res.data.obj.list)
        //                 }
        //             })
        //         }
        //     }
        // })
        for(const item of properties) {
            if (item.valueSchema.type === 'list' && item.valueSchema.source === 'rel') {
                let dynamicSelectRel = item.valueSchema.rel; // 获取到动态下拉框的rel
                if (dynamicSelectRel) {
                    let params = {
                        rel: dynamicSelectRel
                    }
                    getDynamicSelectValue(params).then((res) => {
                        if (res.data.success === true) {
                            setSelectedArray(res.data.obj.list)
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            } else {
                setSelectedArray([])
            }
        }
    }
    // 拖拽创建节点
    function startDragToGraph(graph, item, e) {
         // 创建连接桩
        const ports = {
            groups: {
                top: {
                    position: "top",
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: "#5F95FF",
                            strokeWidth: 1,
                            fill: "#fff",
                            style: {
                                visibility: "hidden",
                            },
                        },
                    },
                },
                bottom: {
                    position: "bottom",
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: "#5F95FF",
                            strokeWidth: 1,
                            fill: "#fff",
                            style: {
                                visibility: "hidden",
                            },
                        },
                    },
                },
            },
            items: [
                {
                    group: "top",
                },
                {
                    group: "bottom",
                },
             ]
        }
        const { left, top } = e.currentTarget.getBoundingClientRect();//画布容器的位置信息
        const posX = e.clientX - left;
        const posY = e.clientY - top;
        // 添加节点node到画布上
        const rect = graph.addNode({
            shape: "rect",
            width: 160,  //节点的宽度
            height: 60,   //节点的高度
            x: posX,//节点位置 x 坐标
            y: posY,//节点位置 y坐标
            label: item.name,//节点名称
            data: item,//节点数据
            attrs: {
                body: {
                    fill: '#fff',
                    stroke: '#000',
                },
                label: {
                    text: item.name,
                    fill: '#333',
                },
            },
            ports: { ...ports },
            tools: [
                {
                    name: 'button-remove',  // 工具名称
                    args: {
                        x: 0,
                        y: 0,
                        onClick({ e, cell }){
                            e.stopPropagation(); // 阻止事件冒泡
                            graph.removeCell(cell);// 删除节点
                            setSelectNode(null);
                        }
                    }, // 工具对应的参数
                },
            ],
        })
        // 创建一个拖拽Dnd 的实例
        const dnd = new Addon.Dnd({
            target:graph,
            scaled: false,
            animation: true,
            getDragNode(rect){
                // console.log(node)
                return  rect.clone({keepId: true})//保持原来的节点ID不变
            },
            getDropNode(rect) {
                // console.log(node)
                return rect.clone({keepId:true})
            }
        })
        dnd.start(rect,e);
        //定义节点拖拽结束事件
        rect.on('dragend', onDragEnd()); 
    }
    function onDragEnd() { 
        // 拖拽结束事件
        console.log('拖拽结束')
    }
    // 保存画布事件
    function saveGraph(){
        let nodesArray = drawGraph.current.getNodes();
        let edgesArray = drawGraph.current.getEdges();
        let graphData={};
        if (nodesArray || edgesArray) {
            let tempNodes = nodesArray.map((item) => {             
                return {
                    nodeId: item.id,
                    key: item.data.key,
                    properties: item.data.properties.map((k) => {
                        return {
                            name: k.name,
                            value: k.value,
                        }
                    }),
                    uiProperties: item,
                    
                }
            })
            let tempEdges = edgesArray.map((item) => {
                return {
                    sourceNodeId: item.source.cell,
                    targetNodeId: item.target.cell,
                    uiProperties: item,
                }
            })
            graphData = {
                nodes: tempNodes,//组装数据之后的节点
                edges: tempEdges,//组装数据之后的边
            }
        }
        // console.log('画布数据---', graphData)
        let params = {
            id: parseInt(flowId),
            name: flowName,
            workflowSchema: graphData
        }
        graphSubmit(params).then((res) => {
            if (res.data.success === true) {
                message.success('保存成功')
                navigate('/index/report/list')
            }
        })
    }

    // 重置画布事件
    function undoGraph(){
        // 获取所有节点和边的ID  
        const allCells = drawGraph.current.getCells();  
        // console.log('所有节点和边---',allCells)
        // 移除所有节点和边  
        drawGraph.current.removeCells(allCells);
        setSelectNode(null);//删除选中节点的属性
    }

    const listItems = nodeList.map((item)=>
        <div className="btnItem" key={item.key}  draggable="true"   onMouseDown={(e)=>dragNodeDown(e,item)}>
        {item.name}
        </div>
    )

    const renderForm = () => { 
        if (!selectNode) return null;
        let properties = selectNode.data.properties;
        // console.log('渲染表单节点----', selectNode,properties)
        const formItems = properties.map(field => {
            // console.log('渲染表单节点属性----', field)
            if (field.valueSchema.type === 'date') {
                if(!field.value){
                    field.value = moment().format("YYYY-MM-DD")
                }
                return (<Form.Item label={field.text}  key={field.name} ><DatePicker format='YYYY-MM-DD' defaultValue={moment(field.value)} onChange={(date, dateString) => handleDateChange(date, dateString, field.name,selectNode)} /></Form.Item>);
            } 
            else if (field.valueSchema.type === 'list') {
                return (
                    <Form.Item label={field.text} key={field.name}>
                        {field.valueSchema.source ==='constant' &&  <Select className='consumeTypeSelect' defaultValue={field.value} onChange={(value)=>handleSelectChange(value, field.name,selectNode)} placeholder="请选择" allowClear >
                                            {
                                                field.valueSchema.constantList.map( (item,index,arr) => (
                                                    <Option key={item.value} value={item.value}>
                                                        {item.name}
                                                    </Option>
                                                ))
                                            }
                        </Select>
                        }
                        {field.valueSchema.source === 'rel' && <Select className='consumeTypeSelect' defaultValue={field.value} onChange={(value) => handleSelectChange(value, field.name, selectNode)} placeholder="请选择" allowClear >
                            
                            {
                                selectedArray.map((item, index, arr) => (
                                    <Option key={item.value} value={item.value}>
                                        {item.name}
                                    </Option>
                                ))
                            }
                        </Select>
                        }
                    </Form.Item>   )
            }
            // 其他表单项-默认输入框  
            return (<Form.Item label={field.text} key={field.name}><Input defaultValue={field.value} onChange={(e) => handleInputChange(e.target.value, field.name,selectNode) }  /></Form.Item>);
        })
        return <Form>{formItems}</Form>;  
    }

     // 渲染的动态表单组件-日期组件事件
    const handleDateChange= useCallback(( date, dateString,fieldName,node)=>{
        // console.log('日期组件事件---', date, dateString, fieldName,node)
        // 非空判断
        dateString = dateString || '';
        // 更新节点属性的一个字段  
        const updatedProperties = node.data.properties;  
        // console.log('日期组件更新节点属性的---',updatedProperties)
        const field = updatedProperties.find(f => f.name === fieldName);  
        // console.log('找到日期组件更新节点属性的一个字段---',field)
        if (field) {  
            field.value = dateString;  
        }  
        setNodeProperties(updatedProperties); 
 
    }, [])
    // // 渲染的动态表单组件-日期范围组件事件
    // const handleRangeDateChange= useCallback(( date, dateStringArray,fieldName,node)=>{
    //     // console.log('日期范围组件事件---', date, dateStringArray, fieldName,node)
    //     // 更新节点属性的一个字段  
    //     const updatedProperties = node.data.properties;  
    //     // console.log('日期组件更新节点属性的一个字段---',updatedProperties)
    //     const field = updatedProperties.find(f => f.name === fieldName);  
    //       if (field) {
    //           // 非空判断
    //           if (dateStringArray !== undefined || dateStringArray.length !== 0) {
    //               dateStringArray = dateStringArray.filter((item, i) => item.trim() !== '')
   
    //               if (dateStringArray.length === 0) {
    //                   field.value = '';
    //               } else {
    //                   field.value = dateStringArray.join(' - ');
    //               }
           
    //           } else {
    //               field.value = '';
    //           }
    //       }
    //     setNodeProperties(updatedProperties);
    // }, [])
     // 渲染的动态表单组件-输入框组件事件
    const handleInputChange = useCallback((value, fieldName, node) => {
        // console.log('输入框组件事件---', value, fieldName,node)
        // 非空判断
        value = value || '';
        // 更新节点属性的一个字段  
        const updatedProperties = node.data.properties;  
        // console.log('输入框组件更新节点属性的一个字段---', updatedProperties)
         const field = updatedProperties.find(f => f.name === fieldName);  
        if (field) {  
            field.value = value;  
        }  
        setNodeProperties(updatedProperties); 
    },[])
     // 渲染的动态表单组件-下拉框组件事件
    const handleSelectChange = useCallback((value, fieldName,node)=>{
        // console.log('下拉框组件事件---', value, fieldName,node)
        // 非空判断
        value = value || '';
        // 更新节点属性的一个字段  
        const updatedProperties = node.data.properties;  
        // console.log('下拉框组件更新节点属性---', updatedProperties)
         const field = updatedProperties.find(f => f.name === fieldName);  
        if (field) {  
            field.value = value;  
        }  
        setNodeProperties(updatedProperties); 
    },[])


    return (
        <section>
             <div className="flowTips">节点排列顺序：数据源 -> 过滤（非必需、可多个）-> 聚合 -> 聚合函数 -> 聚合后过滤（非必需）-> 聚合后排序（非必需）-> 输出图</div>
            {/* 工具栏 */}
            <Toolbar >
            <Group>
                <Item name="zoomIn" tooltip="Zoom In (Cmd +)" icon={<ZoomInOutlined />} />
                <Item name="zoomOut" tooltip="Zoom Out (Cmd -)" icon={<ZoomOutOutlined />} />
                <Item name="save"   tooltip="保存画布" icon={<SaveOutlined />} onClick={()=>saveGraph()} />
                <Item name="reset" tooltip="重置画布" icon={<UndoOutlined />} onClick={()=>undoGraph()}/>
            </Group>
            </Toolbar>
           
            <div className="user-container">
                {/* 左侧节点列表 */}
                <div  className="left-wrap">
                {listItems}
                </div>
                {/* 画布 */}
                <div className="middle-wrap">
                    <div id="container"></div>
                </div>
                {/* 节点属性 */}
                <div className="sidebar-wrap">  
                    {selectNode &&
                        (<div><h2>节点属性</h2> {renderForm()}</div>)
                    }
                </div>
            </div>
        </section>
    )
}
