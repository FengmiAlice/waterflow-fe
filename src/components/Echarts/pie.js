import { useEffect } from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题
 *  @param {array} sourceData 图表数据
 * 
*/
const usePieEcharts = (props)=>{
    const {id,title,sourceData} = props;
    useEffect(()=>{
        // 各类开支占比图
        drawMultiplePie();
        console.log(sourceData)
    })
    function drawMultiplePie() {
        var myPieCharts = echarts.init(document.getElementById(id));
        var multipleOption = {
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
        myPieCharts.setOption(multipleOption);
    }
    return (
        <div id={id} title={title} style={{width:100+'%',height:100+'%'}}>

        </div>
    )
}
export default usePieEcharts;