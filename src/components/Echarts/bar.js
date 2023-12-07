import { useEffect,useCallback} from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts 柱状图组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题
 *  @param {string} barType 柱状图类型（普通或者堆叠）
 *  @param {array} legendData 图表图例数据
 *  @param {array} xData 图表x轴数据
 * @param  {array} seriesData 图表series数据
 * 
*/
const useBarEcharts = (props)=>{
    const {id,title,xData,seriesData,barType} = props;//legendData
    const drawMultipleBar = useCallback(()=>{
        // console.log(barType)
        // let myBarChartDom = echarts.init(document.getElementById(id));

        // 获取DOM id
        let barChartDom = document.getElementById(id);
        // 获取实例
        let barChart = echarts.getInstanceByDom(barChartDom);
        // 如果不存在则创建
        if(!barChart){
            barChart = echarts.init(barChartDom);
        }
        // 适配移动端<576px的屏幕
        let fontBySize;
        let grid = {};
        if (document.documentElement.clientWidth < 576) { 
            fontBySize = 16;
            grid = {
                // left: '3%',
                // right: '4%',
                // bottom: '3%',
                containLabel: true,
            };
        } else {
            fontBySize = 18;
            grid = {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            };
        }
        // 如果是普通类型柱状图
        if(barType === 'single'){
            let multipleOption1 = {
                title: {
                    text: title,
                    left: 'center',
                    testStyle: {
                        fontSize:[fontBySize],
                        color: '#343C4F',
                        fontWeight: 'bold',
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'none'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                toolbox: {
                    feature: {
                        saveAsImage: { show: true }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',//slider表示有滑动块的，inside表示内置的
                        show: true,
                        xAxisIndex: [0],
                        start: 0,
                        end: 50,
                        backgroundColor: 'rgba(0,0,0,0.5)',// 滑块背景颜色
                        fillerColor: 'rgba(255,255,0,0.5)',// 填充颜色
                        showDetail: true,// 拖拽时，是否显示详细信息
                    }
                ],
                grid: [grid],
                legend: {
                    orient: "horizontal",
                    top: 'bottom',
                    show:false,
                    // data:legendData,
                    // ['一月','二月','三月','四月','五月','六月',]
                },
                xAxis: { type: 'category',data:xData },
                yAxis: { type: 'value' },
                series:seriesData
                // series:
                //  [
                //     {
                //         name: '收入',
                //         type: 'bar',
                //         data: [ 474,711, 777, 770, 674, 548]
                //     },
                //     {
                //         name: '支出',
                //         type: 'bar',
                //         data:  [ 474,711, 777, 770, 674, 548]
                //     }
                // ]
            };
            barChart.setOption(multipleOption1);
        }
        // 如果是堆叠类型柱状图
        if(barType === 'stackMultiple'){
            let multipleOption2={
                title:{
                    text: title,
                    left: 'center',
                     // 主标题文字的字体大小
                    textStyle: {
                        fontSize:[fontBySize]
                    }
                },
                tooltip:{
                    trigger: 'axis',
                    axisPointer:{
                        type: 'shadow'
                    }
                },
                legend:{
                    show:false,
                    top:'bottom',
                    // data:legendData,
                    // ['总计','基本生活支出','置装开支']
                },
                grid: [grid],
                xAxis : [
                    {
                        type : 'category',
                        show:true,
                        data : xData,
                        axisLabel:{
                            formatter:'{value}',
                            rich:{
                                value: {
                                    lineHeight: 30,
                                    align: 'center'
                                },
                            }
                        }
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel:{
                            formatter:'{value}',
                        }
                    }
                ],
                series: seriesData,
                // [
                //     {
                //         name: legendData[0],
                //         type: 'bar',
                //         data: [320, 332, 301, 334, 390, 330,]
                //     },
                //     {
                //         name: legendData[1],
                //         type: 'bar',
                //         stack: legendData[0],
                //         data: [120, 132, 101, 134, 90, 230, 210]
                //     },
                //     {
                //         name: legendData[2],
                //         type: 'bar',
                //         stack: legendData[0],
                //         data: [120, 132, 101, 134, 90, 230, 210]
                //     },
                // ]
            };
            barChart.setOption(multipleOption2);
        }
        window.addEventListener('resize',()=>{
            barChart.resize();
        })
    }, [id,title,xData,seriesData,barType]) 
    
    useEffect(()=>{
        drawMultipleBar();
    }, [drawMultipleBar])
    
    return (
        <div id={id} title={title} style={{width:'100%',height:'100%'}}>

        </div>
    )
}
export default useBarEcharts;