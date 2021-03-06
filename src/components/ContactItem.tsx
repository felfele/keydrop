import * as React from 'react';
import { View, Text, StyleSheet, Platform, Clipboard, ActivityIndicator } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';

import { Colors, IconSize, DefaultFont } from '../styles';
import { Contact, isContactOnline, hasContactActiveTransfer } from '../models/Contact';
import { TouchableView } from './TouchableView';
import { SimpleTextInput } from './SimpleTextInput';

interface ContactItemProps {
    isSelected: boolean;
    contact: Contact;

    onSelectContact: (contactPublicKey: string | null) => void;
    onSend: (publicKey: string, address: string, secret: string) => void;
}

const CopyIconName = Platform.OS === 'ios' ? 'ios-copy-outline' : 'md-copy';

export class ContactItem extends React.PureComponent<ContactItemProps> {
    private textInputValue = '';

    public render() {
        const isOnline = isContactOnline(this.props.contact, Date.now());
        const titleColor = isOnline
            ? Colors.DARK_GRAY
            : Colors.LIGHT_GRAY
            ;
        return (
            <TouchableView
                style={styles.listItem}
                onPress={() => {
                    console.log('onPress: ', this.props);
                    this.props.onSelectContact(this.props.isSelected ? null : this.props.contact.publicKey);
                }}
            >
                <View style={styles.listItemTitleContainer}>
                    <View style={styles.listItemTitleLeftContainer}>
                        { isOnline && <View style={styles.listItemOnlineIndicator}/> }
                        <Text style={[styles.listItemTitle, {color: titleColor}]}>{this.props.contact.name}</Text>
                    </View>
                    { isOnline && <this.ListItemTitleRightContainer /> }
                </View>
                <Text style={styles.listItemSubTitle}>{JSON.stringify(this.props.contact)}</Text>
                <View style={styles.listItemSeparatorContainer}>
                    <View style={styles.horizontalRuler}></View>
                </View>
            </TouchableView>
        );
    }

    private ListItemTitleRightContainer = (props) => (
        <View style={styles.listItemTitleRightContainer}>
            { hasContactActiveTransfer(this.props.contact)
            ?
                <View style={styles.listItemProgressIndicator}>
                    <ActivityIndicator size='small' color={Colors.DARK_GRAY} />
                </View>
            :
                <TouchableView onPress={this.onSend}>
                    <Text style={styles.listItemSendText}>Send clipboard</Text>
                </TouchableView>
            }
        </View>
    )

    private onSend = async () => {
        const data = await Clipboard.getString();
        this.props.onSend(this.props.contact.publicKey, this.props.contact.address, data);
        this.props.onSelectContact(null);
    }

    private onChangeText = (text: string) => {
        this.textInputValue = text;
    }
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: Colors.WHITE,
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 0,
        marginHorizontal: 0,
    },
    listItemTitleContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listItemTitleLeftContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    listItemTitleRightContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    listItemOnlineIndicator: {
        width: 10,
        height: 10,
        borderRadius: 10 / 2,
        backgroundColor: Colors.IOS_GREEN,
        marginLeft: 14,
    },
    listItemTitle: {
        fontSize: 17,
        color: Colors.DARK_GRAY,
        fontWeight: '400',
        fontFamily: DefaultFont,
        paddingVertical: 10,
        paddingLeft: 10,
    },
    listItemSendText: {
        borderColor: Colors.LIGHT_GRAY,
        borderWidth: 0.5,
        borderRadius: 3,
        padding: 5,
        marginRight: 10,
        color: Colors.DEFAULT_ACTION_COLOR,
    },
    listItemProgressIndicator: {
        paddingRight: 20,
    },
    listItemSubTitle: {
        fontSize: 12,
        color: Colors.LIGHT_GRAY,
        fontFamily: DefaultFont,
        paddingVertical: 2,
        paddingLeft: 10,
    },
    listItemActionContainer: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 10,
        width: '100%',
    },
    listItemActionButton: {
        paddingTop: 8,
        paddingHorizontal: 3,
    },
    listItemTextInput: {
        marginTop: 2,
        marginLeft: 5,
        padding: 3,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GRAY,
        width: '84%',
    },
    listItemSeparatorContainer: {
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 0,
        paddingTop: 10,
        margin: 0,
        marginHorizontal: 0,
        width: '100%',
    },
    horizontalRuler: {
        backgroundColor: Colors.WHITE,
        padding: 0,
        borderBottomColor: Colors.LIGHT_GRAY,
        borderBottomWidth: 1,
    },
});
