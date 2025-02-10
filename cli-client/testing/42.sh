se2442 logout
se2442 login --username admin --passw freepasses4all
se2442 healthcheck
se2442 resetpasses
se2442 healthcheck
se2442 resetstations
se2442 healthcheck
se2442 admin --addpasses --source passes-full.csv
se2442 healthcheck
se2442 tollstationpasses --station AM08 --from 20220401 --to 20220415 --format json
se2442 tollstationpasses --station NAO04 --from 20220401 --to 20220415 --format csv
se2442 tollstationpasses --station NO01 --from 20220401 --to 20220415 --format csv
se2442 tollstationpasses --station OO03 --from 20220401 --to 20220415 --format csv
se2442 tollstationpasses --station XXX --from 20220401 --to 20220415 --format csv
se2442 tollstationpasses --station OO03 --from 20220401 --to 20220415 --format YYY
se2442 errorparam --station OO03 --from 20220401 --to 20220415 --format csv
se2442 tollstationpasses --station AM08 --from 20220402 --to 20220413 --format json
se2442 tollstationpasses --station NAO04 --from 20220402 --to 20220413 --format csv
se2442 tollstationpasses --station NO01 --from 20220402 --to 20220413 --format csv
se2442 tollstationpasses --station OO03 --from 20220402 --to 20220413 --format csv
se2442 tollstationpasses --station XXX --from 20220402 --to 20220413 --format csv
se2442 tollstationpasses --station OO03 --from 20220402 --to 20220413 --format YYY
se2442 passanalysis --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json
se2442 passanalysis --stationop NAO --tagop AM --from 20220401 --to 20220415 --format csv
se2442 passanalysis --stationop NO --tagop OO --from 20220401 --to 20220415 --format csv
se2442 passanalysis --stationop OO --tagop KO --from 20220401 --to 20220415 --format csv
se2442 passanalysis --stationop XXX --tagop KO --from 20220401 --to 20220415 --format csv
se2442 passanalysis --stationop AM --tagop NAO --from 20220402 --to 20220413 --format json
se2442 passanalysis --stationop NAO --tagop AM --from 20220402 --to 20220413 --format csv
se2442 passanalysis --stationop NO --tagop OO --from 20220402 --to 20220413 --format csv
se2442 passanalysis --stationop OO --tagop KO --from 20220402 --to 20220413 --format csv
se2442 passanalysis --stationop XXX --tagop KO --from 20220402 --to 20220413 --format csv
se2442 passescost --stationop AM --tagop NAO --from 20220401 --to 20220415 --format json
se2442 passescost --stationop NAO --tagop AM --from 20220401 --to 20220415 --format csv
se2442 passescost --stationop NO --tagop OO --from 20220401 --to 20220415 --format csv
se2442 passescost --stationop OO --tagop KO --from 20220401 --to 20220415 --format csv
se2442 passescost --stationop XXX --tagop KO --from 20220401 --to 20220415 --format csv
se2442 passescost --stationop AM --tagop NAO --from 20220402 --to 20220413 --format json
se2442 passescost --stationop NAO --tagop AM --from 20220402 --to 20220413 --format csv
se2442 passescost --stationop NO --tagop OO --from 20220402 --to 20220413 --format csv
se2442 passescost --stationop OO --tagop KO --from 20220402 --to 20220413 --format csv
se2442 passescost --stationop XXX --tagop KO --from 20220402 --to 20220413 --format csv
se2442 chargesby --opid NAO --from 20220401 --to 20220415 --format json
se2442 chargesby --opid GE --from 20220401 --to 20220415 --format csv
se2442 chargesby --opid OO --from 20220401 --to 20220415 --format csv
se2442 chargesby --opid KO --from 20220401 --to 20220415 --format csv
se2442 chargesby --opid NO --from 20220401 --to 20220415 --format csv
se2442 chargesby --opid NAO --from 20220402 --to 20220413 --format json
se2442 chargesby --opid GE --from 20220402 --to 20220413 --format csv
se2442 chargesby --opid OO --from 20220402 --to 20220413 --format csv
se2442 chargesby --opid KO --from 20220402 --to 20220413 --format csv
se2442 chargesby --opid NO --from 20220402 --to 20220413 --format csv