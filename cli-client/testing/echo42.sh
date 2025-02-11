echo 1
se2442 logout  
echo 2
se2442 login --username testuser --passw freepasses4all  
echo 3
se2442 healthcheck  
echo 4
se2442 resetpasses  
echo 5
se2442 healthcheck  
echo 6
se2442 resetstations  
echo 7
se2442 healthcheck  
echo 8
se2442 admin --addpasses --source passes42.csv  
echo 9
se2442 healthcheck  
echo 10
se2442 tollstationpasses --station AM08 --from 20220401 --to 20220415 --format json  
echo 11
se2442 tollstationpasses --station NAO04 --from 20220401 --to 20220415 --format csv  
echo 12
se2442 tollstationpasses --station NO01 --from 20220401 --to 20220415 --format csv  
echo 13
se2442 tollstationpasses --station OO03 --from 20220401 --to 20220415 --format csv  
echo 14
se2442 tollstationpasses --station XXX --from 20220401 --to 20220415 --format csv  
echo 15
se2442 tollstationpasses --station OO03 --from 20220401 --to 20220415 --format YYY  
echo 16
se2442 errorparam --station OO03 --from 20220401 --to 20220415 --format csv  
echo 17
se2442 tollstationpasses --station AM08 --from 20220402 --to 20220413 --format json  
echo 18
se2442 tollstationpasses --station NAO04 --from 20220402 --to 20220413 --format csv  
echo 19
se2442 tollstationpasses --station NO01 --from 20220402 --to 20220413 --format csv  
echo 20
se2442 tollstationpasses --station OO03 --from 20220402 --to 20220413 --format csv  
echo 21
se2442 tollstationpasses --station XXX --from 20220402 --to 20220413 --format csv  
echo 22
se2442 tollstationpasses --station OO03 --from 20220402 --to 20220413 --format YYY  
echo 23
se2442 passanalysis --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json  
echo 24
se2442 passanalysis --stationop NAO --tagop AM --from 20220401 --to 20220415 --format csv  
echo 25
se2442 passanalysis --stationop NO --tagop OO --from 20220401 --to 20220415 --format csv  
echo 26
se2442 passanalysis --stationop OO --tagop KO --from 20220401 --to 20220415 --format csv  
echo 27
se2442 passanalysis --stationop XXX --tagop KO --from 20220401 --to 20220415 --format csv  
echo 28
se2442 passanalysis --stationop AM --tagop NAO --from 20220402 --to 20220413 --format json  
echo 29
se2442 passanalysis --stationop NAO --tagop AM --from 20220402 --to 20220413 --format csv  
echo 30
se2442 passanalysis --stationop NO --tagop OO --from 20220402 --to 20220413 --format csv  
echo 31
se2442 passanalysis --stationop OO --tagop KO --from 20220402 --to 20220413 --format csv  
echo 32
se2442 passanalysis --stationop XXX --tagop KO --from 20220402 --to 20220413 --format csv  
echo 33
se2442 passescost --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json  
echo 34
se2442 passescost --stationop NAO --tagop AM --from 20220401 --to 20220415 --format csv  
echo 35
se2442 passescost --stationop NO --tagop OO --from 20220401 --to 20220415 --format csv  
echo 36
se2442 passescost --stationop OO --tagop KO --from 20220401 --to 20220415 --format csv  
echo 37
se2442 passescost --stationop XXX --tagop KO --from 20220401 --to 20220415 --format csv  
echo 38
se2442 passescost --stationop AM --tagop NAO --from 20220402 --to 20220413 --format json  
echo 39
se2442 passescost --stationop NAO --tagop AM --from 20220402 --to 20220413 --format csv  
echo 40
se2442 passescost --stationop NO --tagop OO --from 20220402 --to 20220413 --format csv  
echo 41
se2442 passescost --stationop OO --tagop KO --from 20220402 --to 20220413 --format csv  
echo 42
se2442 passescost --stationop XXX --tagop KO --from 20220402 --to 20220413 --format csv  
echo 43
se2442 chargesby --opid NAO --from 20220401 --to 20220415 --format json  
echo 44
se2442 chargesby --opid GE --from 20220401 --to 20220415 --format csv  
echo 45
se2442 chargesby --opid OO --from 20220401 --to 20220415 --format csv  
echo 46
se2442 chargesby --opid KO --from 20220401 --to 20220415 --format csv  
echo 47
se2442 chargesby --opid NO --from 20220401 --to 20220415 --format csv  
echo 48
se2442 chargesby --opid NAO --from 20220402 --to 20220413 --format json  
echo 49
se2442 chargesby --opid GE --from 20220402 --to 20220413 --format csv  
echo 50
se2442 chargesby --opid OO --from 20220402 --to 20220413 --format csv  
echo 51
se2442 chargesby --opid KO --from 20220402 --to 20220413 --format csv  
echo 52
se2442 chargesby --opid NO --from 20220402 --to 20220413 --format csv