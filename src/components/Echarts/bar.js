import { useEffect } from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts 柱状图组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题
 *  @param {array} sourceData 图表数据
 * 
*/
const useBarEcharts = (props)=>{
    const {id,title,legendData,xData,seriesData} = props;
    useEffect(()=>{
       
        drawMultipleBar();
      
    })
    function drawMultipleBar() {
        var myBarCharts = echarts.init(document.getElementById(id));
        var multipleOption = {
            title: {
                text: title,
                left: 'center',
                testStyle: {
                    fontSize: 16,
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
            legend: {
                orient: "horizontal",
                top: 'bottom',
                data:legendData,
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
        myBarCharts.setOption(multipleOption);
    }
    return (
        <div id={id} title={title} style={{width:100+'%',height:100+'%'}}>

        </div>
    )
}
export default useBarEcharts;