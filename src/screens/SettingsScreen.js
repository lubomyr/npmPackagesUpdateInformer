import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {FieldWrapper, Dropdown} from '../components';
import {themes} from '../styles/themes';
import {setTheme, saveToStorage} from '../store/themesSlice';

const SettingsScreen = props => {
  const theme = useSelector(state => state?.themes?.theme);
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const {primaryColor} = colors;

  useEffect(() => {
    return () => {
      dispatch(saveToStorage());
    };
  }, []);

  const themeSelector = (
    <FieldWrapper title={'Theme'}>
      <Dropdown
        key={theme?.name}
        style={{backgroundColor: primaryColor, ...styles.dropdownStyle}}
        itemStyle={{backgroundColor: primaryColor}}
        textStyle={styles.dropDownText}
        data={themes}
        value={theme?.name || ''}
        onChange={v => dispatch(setTheme(v))}
      />
    </FieldWrapper>
  );

  return <View style={styles.root}>{themeSelector}</View>;
};
export default SettingsScreen;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    padding: 30,
  },
  dropdownStyle: {
    borderRadius: 4,
  },
  dropDownText: {
    color: 'white',
  },
});
