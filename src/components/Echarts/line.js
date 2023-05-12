import { useEffect } from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts 折线图组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题

 *  @param {array} legendData 图表图例数据
 *  @param {array} xData 图表x轴数据
 * @param  {array} seriesData 图表series数据
 * 
*/
const useLineEcharts = (props)=>{
    const {id,title,xData,seriesData} = props;//legendData

    useEffect(()=>{
        drawMultipleLine();
    })

    function drawMultipleLine() {
        // let lineCharts = echarts.init(document.getElementById(id));
         // 获取DOM id
        let lineChartDom = document.getElementById(id);
        // 获取实例
        let lineChart = echarts.getInstanceByDom(lineChartDom);
        if(!lineChart){
            lineChart = echarts.init(lineChartDom)
        }
        let legend={};
        let grid={};
        // 适配屏幕尺寸
        if(document.documentElement.clientWidth < 576){
            legend =  {
                top:30,
                right:0,
                show: true,
                orient: "horizontal",
                // data:legendData,
            };

            grid = {
                containLabel: true
            };
        }else{
            legend =  {
                top:0,
                right:0,
                show: true,
                orient: "horizontal",
                // data:legendData,
            };

            grid = {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            };
        }
        // 如果不存在则创建
        let lineOption = {
            title: {
                text: title,
            },
            grid: [grid],
            legend:[legend],
            tooltip: {
                trigger: "axis",
                backgroundColor: "#faeffe",
                axisPointer: {
                    type: "shadow",
                    shadowStyle: {
                        color: "#faeffe",
                        opacity: 0.5,
                    },
                },
            },
            xAxis: {
                type: "category",
                data:xData,
                boundaryGap: false
            },
            yAxis: {
                type: "value",
            },
           
            series:seriesData,
            //  [
            //     {
            //         type: "line",
            //         smooth: true,
            //         symbol: "circle",
            //         symbolSize: 8,
            //         symbolOffset: [0, "-50%"],
            //         itemStyle: {
            //             normal: {
            //                 borderColor: "#facf00",
            //                 color: "#fff100",
            //             },
            //         },
            //         areaStyle: {
            //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //                 {
            //                     offset: 0,
            //                     color: "#f7e0fe",
            //                 },
            //                 {
            //                     offset: 1,
            //                     color: "rgba(255, 255, 255, 1)",
            //                 },
            //             ]),
            //         },
            //         lineStyle: {
            //             color: {
            //                 type: "linear",
            //                 colorStops: [
            //                     {
            //                         offset: 0,
            //                         color: "#ffec70", // 0% 处的颜色
            //                     },
            //                     {
            //                         offset: 1,
            //                         color: "#ff609f", // 100% 处的颜色
            //                     },
            //                 ],
            //                 global: false, // 缺省为 false
            //             },
            //         },
            //         data: seriesData,
            //     },
            // ],
        };
        // lineCharts.clear();
        lineChart.setOption(lineOption);
        window.addEventListener('resize',()=>{         
            lineChart.resize()
        })
    }

    return(
        <div id={id} title={title} style={{width:100+'%',height:100+'%'}}></div>
    )

}
export default useLineEcharts;