import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import {withLoader} from '../hocs/withLoader';
import {getPackageAllTags, getPackageDistTags} from '../helpers/apiHelper';
import {Button} from '../components';
import {packagesStore} from '../observers/packageStore';
import {getUpdatedLabel} from '../helpers/timeHelper';
import {applyRefreshMainScreenCallback} from '../helpers/callbackHelper';

const PackageDetails = props => {
  const {navigation, route, setLoading} = props;
  const {packageName} = route?.params;
  const [buttonTitle, setButtonTitle] = useState();
  const [details, setDetails] = useState(null);
  const {styles: themeStyles} = useTheme();
  const {packages, addPackage, deletePackage, saveToStorage} = packagesStore;
  const {name, time, homepage, repository, description, license, maintainers} =
    details || {};
  const distTags = details?.['dist-tags'];
  const getKeys = object => Object.keys(object);

  const retrievePackageDetails = async pName => {
    setLoading(true);
    const fullDetail = await getPackageAllTags(pName);
    if (fullDetail) {
      setDetails(fullDetail);
    }
    setLoading(false);
  };

  const getRepositoryUrl = value => {
    const isGit = value.indexOf('git+') !== -1;
    return isGit ? value.substring(4, value.length) : value;
  };

  useEffect(() => {
    retrievePackageDetails(packageName).then();
  }, []);

  useEffect(() => {
    if (
      packages.some(i => i?.name === packageName) &&
      buttonTitle !== 'Remove'
    ) {
      setButtonTitle('Remove');
    } else if (buttonTitle !== 'Add') {
      setButtonTitle('Add');
    }
  }, [packages]);

  const saveData = () => {
    saveToStorage();
    navigation.goBack();
    applyRefreshMainScreenCallback();
  };

  const onButtonPress = async () => {
    const isAdd = !packages.some(i => i?.name === packageName);
    if (isAdd) {
      setLoading(true);
      const dist = await getPackageDistTags(packageName);
      const fullDetail = await getPackageAllTags(packageName);
      setLoading(false);
      addPackage({
        name: packageName,
        dist,
        time: fullDetail?.time,
      });
      saveData();
    } else {
      deletePackage({name: packageName});
      saveData();
    }
  };

  const topContainer = details ? (
    <View style={styles.row}>
      <View style={[styles.titleView, themeStyles.primaryBackground]}>
        <Text style={[styles.titleText, themeStyles.primaryTextInBackground]}>
          {name}
        </Text>
      </View>
      <Button
        style={styles.button}
        title={buttonTitle}
        onPress={onButtonPress}
      />
    </View>
  ) : null;

  const distKeys = distTags ? getKeys(distTags) : [];
  const distList = distKeys.map(key => (
    <View key={key} style={styles.row}>
      <Text style={[styles.keyText, themeStyles.primaryTextInBackground]}>
        {key}
      </Text>
      <Text style={[styles.valueText, themeStyles.primaryTextInBackground]}>
        {distTags[key]}
      </Text>
      <Text style={[styles.timeText, themeStyles.primaryTextInBackground]}>
        {getUpdatedLabel(time[distTags[key]])}
      </Text>
    </View>
  ));

  const distView = distTags ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        dist-tags
      </Text>
      {distList}
    </View>
  ) : null;

  const homepageView = homepage ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        Home page
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(homepage)}>
        <Text style={[styles.text, themeStyles.primaryTextInBackground]}>
          {homepage}
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  const repositoryView = repository ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        Repository
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(getRepositoryUrl(repository?.url))}>
        <Text style={[styles.text, themeStyles.primaryTextInBackground]}>
          {repository?.url}
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  const descriptionView = description ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        Description
      </Text>
      <View>
        <Text style={[styles.text, themeStyles.primaryTextInBackground]}>
          {description}
        </Text>
      </View>
    </View>
  ) : null;

  const licenseView = description ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        License
      </Text>
      <View>
        <Text style={[styles.text, themeStyles.primaryTextInBackground]}>
          {license}
        </Text>
      </View>
    </View>
  ) : null;

  const maintainersView = maintainers?.length ? (
    <View style={[styles.containerView, themeStyles.primaryBackground]}>
      <Text style={[styles.textBold, themeStyles.primaryTextInBackground]}>
        Maintainers
      </Text>
      <View style={styles.maintainers}>
        {maintainers.map(i => (
          <View key={i?.email} style={styles.row}>
            <Text
              style={[
                styles.maintainerName,
                themeStyles.primaryTextInBackground,
              ]}>
              {i?.name}
            </Text>
            <Text
              style={[
                styles.maintainerEmail,
                themeStyles.primaryTextInBackground,
              ]}>
              {i?.email}
            </Text>
          </View>
        ))}
      </View>
    </View>
  ) : null;

  return (
    <ScrollView>
      <View style={styles.root}>
        {topContainer}
        {distView}
        {descriptionView}
        {homepageView}
        {repositoryView}
        {licenseView}
        {maintainersView}
      </View>
    </ScrollView>
  );
};
export default withLoader(observer(PackageDetails));

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  list: {
    marginTop: 20,
    borderRadius: 10,
  },
  button: {
    marginLeft: 10,
  },
  titleView: {
    flex: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  containerView: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  textBold: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  keyText: {flex: 1},
  valueText: {flex: 1, textAlign: 'center'},
  timeText: {flex: 1, textAlign: 'right'},
  maintainers: {alignItems: 'center'},
  maintainerName: {flex: 1, marginRight: 5, textAlign: 'right'},
  maintainerEmail: {flex: 1, marginLeft: 5},
});
