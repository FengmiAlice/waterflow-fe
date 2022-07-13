import { useEffect } from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts 饼图组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题
 *  @param {array} sourceData 图表数据
 * 
*/
const usePieEcharts = (props)=>{
    const {id,title,sourceData} = props;

    useEffect(()=>{
        drawMultiplePie();
    })

    function drawMultiplePie() {
        // let myPieCharts = echarts.init(document.getElementById(id));
        // 获取DOM ID
        let pieChartDom = document.getElementById(id);
         // 获取实例
         let pieChart = echarts.getInstanceByDom(pieChartDom);
        //  如果不存在则创建
        if(!pieChart){
            pieChart = echarts.init(pieChartDom)
        }
        let multipleOptions = {
            title: {
                text: title,
                left: "center",
            },
            legend: {
                orient: "horizontal",
                top: 'bottom',
                show:false,
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            series: [
                {
                    name: '详情',
                    type: 'pie',
                    radius : [100,130],
                    center: ['50%', '60%'],
                    // roseType: 'radius',
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '28',
                            fontWeight: 'bold'
                        }
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    data:sourceData
                }
            ]
        };
        pieChart.setOption(multipleOptions);
        window.addEventListener('resize',()=>{
            pieChart.resize()
        })
    }

    return (
        <div id={id} title={title} style={{width:100+'%',height:100+'%'}}>

        </div>
    )
}
export default usePieEcharts;