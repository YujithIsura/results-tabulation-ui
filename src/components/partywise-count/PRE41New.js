import React, {Component} from 'react'
import axios from '../../axios-base';
import {
    Typography,
    Button,
    TextField,
    Select,
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    Paper,
    Breadcrumbs,
    Link,
    Grid
} from '@material-ui/core';
import {getNumOrZero} from "../../utils";

class PRE41New extends Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.setElection = this.setElection.bind(this);
        this.state = {
            open: false,
            selected: 'Select',

            candidatesList: [],
            candidatesMap: {},
            content: {},
            summary: {
                rejectedVoteCount: 0
            },

            tallySheetId: 0,
            reportId: 0,

            areaId: 0,
            area: null,
            pollingDivision: null,
            electoralDistrict: null,
            sum: 0,
            vals: 0,

            tallySheetVersionId: 0,
            latestVersionId: 0,
            // filledData:[]
        };
        this.calculation = [0];
    }

    getValidVoteCountTotal() {
        let validVoteCountTotal = 0;
        for (var candidateIndex = 0; candidateIndex < this.state.candidatesList.length; candidateIndex++) {
            let candidateId = this.state.candidatesList[candidateIndex];
            let validVoteCount = this.getInputValue(candidateId, "count");
            validVoteCount = getNumOrZero(validVoteCount);
            validVoteCountTotal += validVoteCount;
        }

        return validVoteCountTotal
    }

    getVoteCountTotal() {
        let validVoteCountTotal = this.getValidVoteCountTotal();
        let rejectedVoteCount = this.getRejectedVoteCount();
        rejectedVoteCount = getNumOrZero(rejectedVoteCount);

        return validVoteCountTotal + rejectedVoteCount;
    }


    getCountingCentreName() {
        if (this.state.area) {
            return this.state.area.areaName;
        }
        return null
    }

    setElection(election) {
        var parties = election.parties;
        var candidateMap = {};
        var content = {};
        var candidatesList = parties.map((party) => {
            var candidate = party.candidates[0];
            candidate.partyName = party.partyName;

            candidateMap[candidate.candidateId] = candidate;
            content[candidate.candidateId] = {
                "candidateId": candidate.candidateId,
                "count": 0,
                "countInWords": ""
            };
            return candidate.candidateId
        })
        this.setState({
            candidatesList,
            candidateMap,
            content
        })
    }

    componentWillMount() {
        window.addEventListener('popstate', (event) => {
           alert('You will move to PRE 41')
        });
    }


    // submit the form data
    handleSubmit = (event) => {
        const {tallySheetId} = this.props.match.params
        console.log("tallySheet ID :", tallySheetId)
        event.preventDefault()
        // if (this.state.content[1].count === null || this.state.content[2].count === null ||
        //     this.state.content[1].countInWords === null || this.state.content[2].countInWords === null) {
        //     alert("Please Enter the necessary fields !")
        //
        // } else {
        axios.post('/tally-sheet/PRE-41/' + tallySheetId + '/version', {
                "content": this.state.candidatesList.map((candidateId) => {
                    return {
                        "candidateId": candidateId,
                        "count": parseInt(this.state.content[candidateId].count),
                        "countInWords": this.state.content[candidateId].countInWords
                    }
                }),
                "summary": {
                    "rejectedVoteCount": parseInt(this.state.summary.rejectedVoteCount)
                }
            },
            {
                headers: {
                    'authorization': "Bearer " + localStorage.getItem('token'),
                }
            }
        )
            .then(res => {
                // console.log("Result" + res.data.latestVersionId);
                console.log(res.data.htmlUrl);
                // alert("Successfully Created the TallySheet - PRE41")
                this.props.history.push('/PRE41Report/' + this.state.tallySheetId + '/' + res.data.tallySheetVersionId)


            }).catch((error) => console.log(error));
        //}
    }

    handleClickOpen() {
        this.setState({open: true});
    }

    handleBack() {
        this.props.history.goBack()

    }

    // modal controllers
    handleClose() {
        this.setState({open: false});
    }

    handleChange = event => {
        this.setState({selected: event.target.value, name: event.target.name});
    };

    // handleInputChange = (invalidTypeId, property) => (event) => {
    //     this.calculation[invalidTypeId] = parseInt(event.target.value);
    //     console.log(this.calculation);
    //
    //     this.setState({
    //         ...this.state,
    //         content: {
    //             ...this.state.content,
    //             [invalidTypeId]: {
    //                 ...this.state.content[invalidTypeId],
    //                 [property]: event.target.value
    //             }
    //         }
    //     })
    //
    //     this.setState({
    //         sum: this.calculation.reduce((total, amount) => total + amount)
    //     })
    // }

    /** Rejected **/
    handleRejectedVoteCount = event => {
        const rejectedVoteCount = event.target.value;
        this.setRejectedVoteCount(rejectedVoteCount)
    }

    getInputValue(candidateId, property) {
        const value = this.state.content[candidateId][property];
        if (value === null || value === undefined) {
            return undefined
        } else {
            return value
        }
    }

    setInputValue(candidateId, property, value) {
        this.setState({
            ...this.state,
            content: {
                ...this.state.content,
                [candidateId]: {
                    ...this.state.content[candidateId],
                    [property]: value
                }
            }
        })
    }

    setRejectedVoteCount(rejectedVoteCount) {
        this.setState({
            ...this.state,
            summary: {
                ...this.state.summary,
                rejectedVoteCount: rejectedVoteCount
            }
        })
    }

    getRejectedVoteCount() {
        return this.state.summary.rejectedVoteCount
    }

    handleInputChange = (candidateId, property) => (event) => {

        console.log("property", property)
        console.log(event.target.value);
        const value = event.target.value
        this.setInputValue(candidateId, property, value)

        // console.log("NN",event.target.name);
        // if ((name) === "votes"+candidateId){
        //     this.calculation[candidateId] = parseInt(event.target.value);
        //     console.log(this.calculation);
        // }else{
        //     console.log("NaN");
        // }
        // this.setState({
        //     ...this.state,
        //     content: {
        //         ...this.state.content,
        //         [candidateId]: {
        //             ...this.state.content[candidateId],
        //             [property]: event.target.value
        //         }
        //     }
        // })
        //
        // this.setState({
        //     sum: this.calculation.reduce((total, amount) => total + amount)
        // })
    }

    componentDidMount() {
        const {tallySheetId} = this.props.match.params
        console.log("tally sheet Id ", tallySheetId)
        this.setState({
            tallySheetId: tallySheetId
        })

        /** get tally sheet by ID **/
        axios.get('/tally-sheet/' + tallySheetId, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('token'),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(res => {
            console.log("New tally VERSION", res.data.latestVersionId)
            this.setState({
                latestVersionId: res.data.latestVersionId,
                area: res.data.area,
                areaId: res.data.area.areaId
            })

            /** get electoral district name **/
            axios.get('/area?limit=1000&offset=0&associatedAreaId=' + this.state.areaId + '&areaType=ElectoralDistrict', {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token'),
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then(res => {
                this.setState({
                    electoralDistrict: res.data[0].areaName
                })
            }).catch((error) => console.log(error));

            /** get polling division name **/
            axios.get('/area?limit=1000&offset=0&associatedAreaId=' + this.state.areaId + '&areaType=PollingDivision', {
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem('token'),
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then(res => {
                this.setState({
                    pollingDivision: res.data[0].areaName
                })
            }).catch((error) => console.log(error));


            if (res.data.latestVersionId === "null") {
                // alert("No Latest version for here !")
            } else {

                axios.get('/election?limit=1000&offset=0', {
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token'),
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }).then(res => {
                    console.log("Election" + res.data[0].parties)
                    this.setElection(res.data[0])

                    axios.get('/tally-sheet/PRE-41/' + tallySheetId + '/version/' + this.state.latestVersionId, {
                        headers: {
                            'Authorization': "Bearer " + localStorage.getItem('token'),
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET',
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).then(res => {
                        // console.log("get PRE 41 > >" + res.data.htmlUrl)
                        // console.log("get PRE 41 nndd > >" + res.data.content)
                        // this.setState({
                        //     filledData: res.data.content
                        // })

                        const candidateWiseCounts = res.data.content;
                        for (var i = 0; i < candidateWiseCounts.length; i++) {

                            let candidateWiseCount = candidateWiseCounts[i];
                            console.log("Loop" + candidateWiseCount.count)
                            this.setInputValue(candidateWiseCount.candidateId, "count", candidateWiseCount.count);
                            this.setInputValue(candidateWiseCount.candidateId, "countInWords", candidateWiseCount.countInWords);
                        }

                        this.setRejectedVoteCount(res.data.summary.rejectedVoteCount)

                        // debugger;
                        // console.log("filled data> >" + this.state.filledData)
                    }).catch((error) => console.log(error));

                }).catch((error) => console.log(error));

            }
        })
            .catch((error) => console.log(error));


    }

    render() {
        return (
            <div style={{backgroundColor: '#fff8e8', padding: '3%'}}>
                <div>
                    <div style={{marginBottom: '3%'}}>

                        <Breadcrumbs style={{marginLeft: '0.2%', marginBottom: '2%', fontSize: '14px'}} separator="/"
                                     aria-label="breadcrumb">
                            <Link color="inherit" href="/Election">
                                Home
                            </Link>
                            <Link color="inherit" href="/Main">
                                Presidential Election
                            </Link>
                            <Link color="inherit" href="/Home">
                                Data Entry
                            </Link>
                            <Link color="inherit">
                                Votes - PRE 41
                            </Link>
                            <Link color="inherit">
                                Tally Sheet
                            </Link>
                            {/*<Typography color="textPrimary"></Typography>*/}
                        </Breadcrumbs>
                        <Typography variant="h4" gutterBottom>
                            Presidential Election 2019
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            PRE 41
                        </Typography>
                        <br/>

                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <Typography style={{fontWeight: 'bold'}} variant="h5" gutterBottom>
                                    Electoral District : {this.state.electoralDistrict}
                                </Typography>
                            </Grid>
                            {this.state.pollingDivision !== null &&  <Grid item xs={4}>
                                    <Typography style={{fontWeight: 'bold'}} variant="h5" gutterBottom>
                                        Polling Division : {this.state.pollingDivision}
                                    </Typography>
                                </Grid>}
                            <Grid item xs={4}>
                                <Typography style={{fontWeight: 'bold'}} variant="h5" gutterBottom>
                                    Counting Hall No : {this.getCountingCentreName()}

                                </Typography>
                            </Grid>
                        </Grid>

                        {/*<Typography variant="h5" gutterBottom>*/}
                        {/*PRE 41 - Counting Hall No :  {this.getCountingCentreName()}*/}
                        {/*/!*PRE-41 - Tally Sheet ID : {this.props.match.params.name}*!/*/}
                        {/*</Typography>*/}
                    </div>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className="header"
                                               style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>
                                        No</TableCell>

                                    <TableCell className="header"
                                               style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>Name of
                                        Candidate</TableCell>
                                    <TableCell className="header"
                                               style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>
                                        Party Name</TableCell>
                                    <TableCell className="header"
                                               style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>No of votes in
                                        words</TableCell>
                                    <TableCell className="header"
                                               style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>No of votes in
                                        figures</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.candidatesList.map((candidateId, idx) => {

                                    var candidate = this.state.candidateMap[candidateId];
                                    return <TableRow style={idx % 2 ? {background: "white"} : {background: "#f6f6f6"}}>
                                        <TableCell
                                            style={{width: '6%', fontSize: 13}}>{idx + 1}</TableCell>

                                        <TableCell
                                            style={{width: '22%', fontSize: 13}}>{candidate.candidateName}</TableCell>

                                        <TableCell
                                            style={{width: '24%', fontSize: 13}}>{candidate.partyName}</TableCell>

                                        <TableCell style={{width: '25%', fontSize: 13}}>Votes in words :
                                            <TextField
                                                fullWidth="160"
                                                id="outlined-dense"
                                                margin="dense"
                                                variant="outlined"
                                                // label={this.state.filledData[idx].count}
                                                // name={'votesWords' + (idx + 1)}
                                                //defaultValue={this.state.filledData[idx].countInWords}
                                                // placeholder={this.state.filledData[idx].countInWords}
                                                value={this.getInputValue(candidateId, "countInWords")}
                                                autoComplete='off'
                                                onChange={this.handleInputChange(candidateId, "countInWords")}
                                            />
                                        </TableCell>
                                        <TableCell style={{width: '34%', fontSize: 13}}> Votes in figures :
                                            <TextField
                                                id="outlined-dense"
                                                margin="dense"
                                                variant="outlined"
                                                type="number"
                                                //label="No of votes"
                                                // name={'votes' + (idx + 1)}
                                                autoComplete='off'
                                                //defaultValue={this.state.filledData[idx].count}
                                                value={this.getInputValue(candidateId, "count")}
                                                // defaultValue={this.state.vals}
                                                onChange={this.handleInputChange(candidateId, "count")}
                                            />
                                        </TableCell>

                                    </TableRow>
                                })}


                                <TableRow>
                                    <TableCell
                                        style={{width: '4%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '20%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '30%', fontSize: 13}}></TableCell>
                                    <TableCell style={{fontSize: 15, color: 'black', fontWeight: 'bold'}}>එකතුව / மொத்தம்
                                        / Total : </TableCell>

                                    <TableCell
                                        style={{paddingLeft: '2%', width: '30%', fontSize: 16, fontWeight: 'bold'}}>
                                        {this.getValidVoteCountTotal()}
                                    </TableCell>

                                    {/*<TableCell style={{paddingLeft:'2%',width: '30%', fontSize: 16,fontWeight: 'bold'}}>*/}
                                    {/*{this.state.sum}*/}
                                    {/*</TableCell>*/}
                                </TableRow>

                                <TableRow bgcolor="#DDDDDD">
                                    <TableCell
                                        style={{width: '4%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '20%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '30%', fontSize: 13}}></TableCell>
                                    <TableCell style={{fontSize: 15, color: 'black', fontWeight: 'bold'}}>ප්‍රතික්ෂේප කළ
                                        ඡන්ද / நிராகரிக்கப்பட்ட வாக்குகள் / Rejected Votes :</TableCell>
                                    <TableCell
                                        style={{fontSize: 14,}}>
                                        <TextField
                                            id="outlined-dense"
                                            margin="dense"
                                            variant="outlined"
                                            //label="Rejected Votes"
                                            error={"required field null"}
                                            helperText={this.getRejectedVoteCount() === "" ? 'This field is required!' : ' '}
                                            autoComplete='off'
                                            value={this.getRejectedVoteCount()}
                                            onChange={this.handleRejectedVoteCount}
                                        /></TableCell>
                                    {/*<TableCell style={{paddingLeft:'2%',width: '30%', fontSize: 16,fontWeight: 'bold'}}>*/}
                                    {/*{this.state.sum}*/}
                                    {/*</TableCell>*/}
                                </TableRow>

                                <TableRow>
                                    <TableCell
                                        style={{width: '4%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '20%', fontSize: 13}}></TableCell>
                                    <TableCell
                                        style={{width: '30%', fontSize: 13}}></TableCell>

                                    <TableCell style={{fontSize: 15, color: 'black', fontWeight: 'bold'}}>මුලු එකතුව /
                                        முழு மொத்தம் / Grand Total
                                        :</TableCell>

                                    <TableCell
                                        style={{paddingLeft: '2%', width: '30%', fontSize: 16, fontWeight: 'bold'}}>
                                        {this.getVoteCountTotal()}
                                    </TableCell>

                                    {/*<TableCell style={{paddingLeft:'2%',width: '30%', fontSize: 16,fontWeight: 'bold'}}>*/}
                                    {/*{this.state.sum}*/}
                                    {/*</TableCell>*/}
                                </TableRow>

                            </TableBody>
                        </Table>
                    </Paper>
                </div>

                <div style={{marginLeft: '80%', marginTop: '2%'}}>
                    <Button style={{borderRadius: 18, color: 'white', marginRight: '4%'}} onClick={this.handleBack}
                            className="button">Back</Button>
                    <Button style={{borderRadius: 18, color: 'white'}} onClick={this.handleSubmit}
                            className="button">Next</Button>
                </div>

            </div>
        )
    }
}

export default PRE41New;
