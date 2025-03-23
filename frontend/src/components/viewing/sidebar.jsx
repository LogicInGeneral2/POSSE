import React from 'react';
import { CgFormatText } from 'react-icons/cg';
import { TbBookDownload } from 'react-icons/tb';
import { BiHide, BiImageAdd, BiShow } from 'react-icons/bi';
import { BsBorderWidth, BsCircle, BsSquare } from 'react-icons/bs';
import { AiOutlineClear, AiOutlineDelete, AiOutlineHighlight } from 'react-icons/ai';
import { HiPencil } from 'react-icons/hi';
import { FiSave } from 'react-icons/fi';
import { useButtons } from './canvas';
import { Popover, Slider, CircularProgress } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { SketchPicker } from 'react-color';

export default function SideBar() {
    const contextValues = useButtons();
    const [openColor, setOpenColor] = React.useState(false);
    const [openBorderColor, setOpenBorderColor] = React.useState(false);
    const [openStroke, setOpenStroke] = React.useState(false);

    return (
        <div style={{
            position: 'fixed',
            zIndex: 50,
            top: '85%',
            left: 0,
            height: '15vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                padding: '8px',
                textAlign: 'center',
                minWidth: '8vw',
                gap: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                color: 'black',
                borderRadius: '8px',
                boxShadow: '0px 0px 8px rgba(0,0,0,0.1)',
            }}>

                <Tooltip title="Square">
                    <div>
                        <BsSquare style={{ cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => contextValues.addRect(contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="Circle">
                    <div>
                        <BsCircle style={{ cursor: 'pointer' }} onClick={() => contextValues.addCircle(contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="TextBox">
                    <div>
                        <CgFormatText style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.addText(contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="Add Image">
                    <div>
                        <label htmlFor="img-input">
                            <BiImageAdd style={{ cursor: 'pointer', fontSize: '1.5rem' }} />
                        </label>
                        <input type="file" id="img-input" accept='image/*' style={{ display: "none" }} onChange={(e) => contextValues.addImage(e, contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="Draw">
                    <div>
                        <HiPencil style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.toggleDraw(contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="Highlight">
                    <div>
                        <AiOutlineHighlight style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.addHighlight(contextValues.canvas)} />
                    </div>
                </Tooltip>

                <Tooltip title="Delete Selected">
                    <div>
                        <AiOutlineDelete style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.deleteBtn()} />
                    </div>
                </Tooltip>

                <Tooltip title="Reset Page">
                    <div>
                        <AiOutlineClear style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.canvas.clear()} />
                    </div>
                </Tooltip>

                <Tooltip title="Download Current Page">
                    <div>
                        <TbBookDownload style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => contextValues.downloadPage()} />
                    </div>
                </Tooltip>

                <Tooltip title="Border Color">
                    <div style={{
                        cursor: 'pointer',
                        width: '1.6rem',
                        height: '1.6rem',
                        borderRadius: '50%',
                        border: `4px dotted ${contextValues.borderColor}`
                    }} onClick={(e) => setOpenBorderColor(e.currentTarget)}></div>
                </Tooltip>
                <Popover
                    id="simple-popover"
                    open={Boolean(openBorderColor)}
                    anchorEl={openBorderColor}
                    onClose={() => setOpenBorderColor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <SketchPicker
                        color={contextValues.borderColor}
                        onChangeComplete={col => contextValues.setBorderColor(col.hex)}
                    />
                </Popover>

                <Tooltip title="Fill Color Picker">
                    <div style={{
                        cursor: 'pointer',
                        width: '1.6rem',
                        height: '1.6rem',
                        borderRadius: '50%',
                        backgroundColor: contextValues.color
                    }} onClick={(e) => setOpenColor(e.currentTarget)}></div>
                </Tooltip>
                <Popover
                    id="simple-popover"
                    open={Boolean(openColor)}
                    anchorEl={openColor}
                    onClose={() => setOpenColor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <SketchPicker
                        color={contextValues.color}
                        onChangeComplete={col => contextValues.setColor(col.hex)}
                    />
                </Popover>

                <Tooltip title="Stroke Width">
                    <div style={{ cursor: 'pointer' }}>
                        <BsBorderWidth onClick={(e) => setOpenStroke(e.currentTarget)} />
                    </div>
                </Tooltip>
                <Popover
                    id="simple-popover"
                    open={Boolean(openStroke)}
                    anchorEl={openStroke}
                    onClose={() => setOpenStroke(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <div style={{
                        minWidth: '20vw',
                        minHeight: '8vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        justifyContent: 'center',
                        padding: '8px',
                        gap: '8px',
                    }}>
                        <div>Stroke Width</div>
                        <Slider
                            aria-label="Small steps"
                            value={contextValues.strokeWidth}
                            step={1}
                            min={0}
                            max={10}
                            onChange={(e) => contextValues.setStrokeWidth(e.target.value)}
                            valueLabelDisplay="auto"
                        />
                    </div>
                </Popover>

                <Tooltip title="Hide/unHide Canvas">
                    <div style={{ cursor: 'pointer' }} onClick={() => contextValues.setHiddenCanvas(old => !old)}>
                        {contextValues.hideCanvas ? <BiHide style={{ fontSize: '1.5rem' }} /> : <BiShow style={{ fontSize: '1.5rem' }} />}
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}