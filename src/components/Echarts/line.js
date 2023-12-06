import { useEffect,useCallback} from "react";
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
    const drawMultipleLine = useCallback(()=>{
        // let lineCharts = echarts.init(document.getElementById(id));
         // 获取DOM id
        let lineChartDom = document.getElementById(id);
        // 获取实例
        let lineChart = echarts.getInstanceByDom(lineChartDom);
        // 如果不存在则创建
        if (!lineChart) {
            lineChart = echarts.init(lineChartDom);
        }
        let lineOption = {
            title: {
                text: title,
            },
            grid: {
                 containLabel: true
            },
            legend: {
                top:30,
                right:0,
                show: true,
                orient: "horizontal",
            },
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
        };
        lineChart.setOption(lineOption);
        window.addEventListener('resize', () => {   
                lineChart.resize();
        })
    },[id,title,xData,seriesData]) 

    useEffect(()=>{
        drawMultipleLine();
    },[drawMultipleLine])

  
    return(
        <div id={id} title={title} style={{width:'100%',height:'100%'}}></div>
    )

}
export default useLineEcharts;